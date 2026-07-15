from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services import referrals as referrals_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/me")
def my_referrals(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """The signed-in user's referral code, earnings and history."""
    return referrals_service.my_summary(db, user)


@router.get("/admin", dependencies=[Depends(require_admin)])
def admin_referrals(db: Session = Depends(get_db)) -> dict:
    return referrals_service.list_all(db)


@router.post("/admin/{referral_id}/paid", dependencies=[Depends(require_admin)])
def admin_mark_paid(referral_id: int, db: Session = Depends(get_db)) -> dict:
    if not referrals_service.mark_paid(db, referral_id):
        raise HTTPException(status_code=404, detail="Referral not found")
    return {"id": referral_id, "status": "paid"}
