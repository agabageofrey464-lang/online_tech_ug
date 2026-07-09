from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_token, decode_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, RegisterIn, TokenOut, UserOut
from app.services import auth as auth_service

router = APIRouter()


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
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> dict:
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
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    return {"access_token": create_token(user.id, user.role), "user": user}


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> dict:
    user = auth_service.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_token(user.id, user.role), "user": user}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
