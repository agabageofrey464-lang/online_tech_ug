from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.payment import PaymentIn, StatusIn
from app.services import payments as payments_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("", status_code=201)
def report_payment(payload: PaymentIn, db: Session = Depends(get_db)) -> dict:
    """Public: a payer records a Mobile Money payment they've made."""
    p = payments_service.create(db, payload.model_dump())
    return {"id": p.id, "ok": True}


@router.get("/admin", dependencies=[Depends(require_admin)])
def admin_payments(db: Session = Depends(get_db)) -> dict:
    return payments_service.list_payments(db)


@router.patch("/admin/{payment_id}", dependencies=[Depends(require_admin)])
def update_payment(payment_id: int, payload: StatusIn, db: Session = Depends(get_db)) -> dict:
    if not payments_service.set_status(db, payment_id, payload.status):
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"id": payment_id, "status": payload.status}
