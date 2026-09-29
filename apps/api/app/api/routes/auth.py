import time

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.core import ratelimit
from app.core.config import settings
from app.core.security import create_token, decode_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    CodeIn,
    LoginIn,
    LoginOtpIn,
    LoginResult,
    RegisterIn,
    ToggleIn,
    TokenOut,
    UserOut,
)
from app.services import auth as auth_service
from app.services.email import send_login_otp, send_verification_code

router = APIRouter()

TOO_MANY = "Too many attempts. Please wait a few minutes and try again."


def _client_ip(request: Request) -> str:
    """Real client IP, honouring the nginx X-Forwarded-For header."""
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _limit(key: str, limit: int, window: int) -> None:
    if not ratelimit.allow(key, limit, window):
        raise HTTPException(status_code=429, detail=TOO_MANY)


def get_current_user(
    authorization: str = Header(default=""), db: Session = Depends(get_db)
) -> User:
    """Resolve the logged-in user from a `Bearer <token>` Authorization header."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    data = decode_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = auth_service.get_by_id(db, int(data["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Account not found")
    return user


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(payload: RegisterIn, request: Request, db: Session = Depends(get_db)) -> dict:
    _limit(f"register:{_client_ip(request)}", limit=6, window=3600)
    if payload.role == "vendor" and not payload.business_name.strip():
        raise HTTPException(status_code=400, detail="Business name is required for vendors")
    try:
        user = auth_service.create_user(
            db,
            name=payload.name,
            email=payload.email,
            password=payload.password,
            phone=payload.phone,
            role=payload.role,
            business_name=payload.business_name,
            business_category=payload.business_category,
            location=payload.location,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    # Email a verification code (non-blocking to sign-up — account is usable,
    # but the UI nudges them to verify).
    code = auth_service.issue_verification_code(db, user)
    await send_verification_code(to=user.email, name=user.name, code=code)
    return {"access_token": create_token(user.id, user.role), "user": user}


@router.post("/login", response_model=LoginResult)
async def login(payload: LoginIn, request: Request, db: Session = Depends(get_db)) -> dict:
    # Throttle by IP and by account to blunt password guessing / credential stuffing.
    _limit(f"login-ip:{_client_ip(request)}", limit=15, window=300)
    _limit(f"login-acct:{payload.email.lower()}", limit=8, window=600)
    user = auth_service.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.twofa_enabled:
        code = auth_service.issue_twofa_code(db, user)
        await send_login_otp(to=user.email, name=user.name, code=code)
        return {"twofa_required": True}
    return {"access_token": create_token(user.id, user.role), "user": user}


@router.post("/login/verify", response_model=TokenOut)
def login_verify(payload: LoginOtpIn, request: Request, db: Session = Depends(get_db)) -> dict:
    """Second step of a 2FA login: exchange the emailed OTP for a token."""
    # Cap OTP guesses per account (codes are 6 digits and expire in 20 min).
    _limit(f"otp:{payload.email.lower()}", limit=6, window=600)
    user = auth_service.get_by_email(db, payload.email)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Account not found")
    if not auth_service.check_twofa_code(db, user, payload.code):
        raise HTTPException(status_code=401, detail="Invalid or expired code")
    return {"access_token": create_token(user.id, user.role), "user": user}


@router.get("/me", response_model=UserOut)
def me(
    response: Response,
    authorization: str = Header(default=""),
    user: User = Depends(get_current_user),
) -> User:
    """The signed-in user, renewing the session if it is past halfway.

    The token *is* the session — there is no refresh token and no server-side
    store — so when it lapsed the customer was simply signed out wherever they
    happened to be. The web app calls this on every load, which makes it the
    natural place to hand back a fresh token: anyone using the site regularly
    is never asked to sign in again, while a session left alone still expires.

    It goes back as a header so the response body keeps its shape for the other
    apps that read this endpoint.
    """
    _, _, token = authorization.partition(" ")
    data = decode_token(token) if token else None
    if data:
        total = settings.access_token_expire_minutes * 60
        remaining = int(data.get("exp", 0)) - int(time.time())
        if remaining < total // 2:
            response.headers["X-Refreshed-Token"] = create_token(user.id, user.role)
            # Without this the browser cannot read the header on a cross-origin
            # reply, and the renewal would silently never arrive.
            response.headers["Access-Control-Expose-Headers"] = "X-Refreshed-Token"
    return user


@router.post("/verify-email", response_model=UserOut)
def verify_email(
    payload: CodeIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> User:
    _limit(f"verify-email:{user.id}", limit=10, window=600)
    if not auth_service.confirm_email(db, user, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return user


@router.post("/resend-verification")
async def resend_verification(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    _limit(f"resend:{user.id}", limit=4, window=900)
    if user.email_verified:
        return {"ok": True, "already_verified": True}
    code = auth_service.issue_verification_code(db, user)
    await send_verification_code(to=user.email, name=user.name, code=code)
    return {"ok": True}


@router.post("/2fa", response_model=UserOut)
def set_twofa(
    payload: ToggleIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> User:
    if payload.enabled and not user.email_verified:
        raise HTTPException(status_code=400, detail="Verify your email before enabling 2FA")
    auth_service.set_twofa(db, user, payload.enabled)
    return user
