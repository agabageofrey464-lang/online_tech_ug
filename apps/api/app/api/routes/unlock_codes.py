from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.unlock_code import (
    GenerateIn,
    RegisterIn,
    RegisterOut,
    UnlockCodeOut,
    VerifyIn,
    VerifyOut,
)
from app.services import unlock_codes
from app.services.courses import get_course
from app.services.email import send_enrollment_alert

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/verify", response_model=VerifyOut)
def verify(payload: VerifyIn, db: Session = Depends(get_db)) -> dict:
    """Public: verify a learner's unlock code. Device-bound — the code locks to the
    first device that redeems it, so a shared code fails elsewhere. Returns which
    lesson it unlocks (null = whole course)."""
    return unlock_codes.verify_code(db, payload.course_slug, payload.code, payload.device_token)


@router.post("/register", response_model=RegisterOut, status_code=201)
async def register(payload: RegisterIn, db: Session = Depends(get_db)) -> dict:
    """Public: a learner registers for a course and is auto-issued a PENDING unlock
    code, which is emailed to them automatically. The code only unlocks the course
    once payment is confirmed and an admin activates it."""
    note = f"{payload.name} · {payload.phone}" + (f" · {payload.email}" if payload.email else "")
    try:
        # Active immediately — the learner never sees it; only the owner (who emails
        # it out after confirming payment) does. No separate activation step needed.
        created = unlock_codes.generate_code(
            db, payload.course_slug, note=note, pending=False, email=payload.email
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # The learner never sees the code — email it to the OWNER (contact inbox) so
    # they can send it to the learner after confirming payment.
    course = get_course(db, payload.course_slug)
    await send_enrollment_alert(
        course_title=course["title"] if course else payload.course_slug,
        code=created["code"],
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        price=int(course["price_ugx"]) if course and course.get("price_ugx") else 0,
    )

    # Return no code — the owner distributes it manually.
    return {"code": "", "course_slug": payload.course_slug, "pending": False}


@router.post("", response_model=UnlockCodeOut, status_code=201, dependencies=[Depends(require_admin)])
def generate(payload: GenerateIn, db: Session = Depends(get_db)) -> dict:
    try:
        return unlock_codes.generate_code(
            db, payload.course_slug, payload.note, lesson=payload.lesson
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("", response_model=list[UnlockCodeOut], dependencies=[Depends(require_admin)])
def list_codes(
    course: str | None = Query(default=None), db: Session = Depends(get_db)
) -> list[dict]:
    return unlock_codes.list_codes(db, course)


@router.post(
    "/{code_id}/revoke", response_model=UnlockCodeOut, dependencies=[Depends(require_admin)]
)
def revoke(code_id: int, revoked: bool = Query(default=True), db: Session = Depends(get_db)) -> dict:
    row = unlock_codes.set_revoked(db, code_id, revoked)
    if not row:
        raise HTTPException(status_code=404, detail="Code not found")
    return row
