from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.unlock_code import GenerateIn, UnlockCodeOut, VerifyIn, VerifyOut
from app.services import unlock_codes

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/verify", response_model=VerifyOut)
def verify(payload: VerifyIn, db: Session = Depends(get_db)) -> dict:
    """Public: verify a learner's unlock code for a course."""
    return {"valid": unlock_codes.verify_code(db, payload.course_slug, payload.code)}


@router.post("", response_model=UnlockCodeOut, status_code=201, dependencies=[Depends(require_admin)])
def generate(payload: GenerateIn, db: Session = Depends(get_db)) -> dict:
    try:
        return unlock_codes.generate_code(db, payload.course_slug, payload.note)
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
