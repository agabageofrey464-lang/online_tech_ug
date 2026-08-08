import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.payment import PaymentIn, StatusIn
from app.services import flutterwave
from app.services import orders as orders_service
from app.services import payments as payments_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class OnlineInitIn(BaseModel):
    reference: str


@router.post("/online/init")
async def online_init(payload: OnlineInitIn, db: Session = Depends(get_db)) -> dict:
    """Start an online payment (Flutterwave) for an existing order. Returns a
    checkout link to redirect the customer to (MTN, Airtel or card)."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    order = orders_service.get_order(db, payload.reference)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    tx_ref = f"{order.reference}-{secrets.token_hex(3)}"
    redirect_url = f"{settings.site_url}/checkout/success?ref={order.reference}"
    try:
        link = await flutterwave.create_payment(
            amount=int(order.total), email=order.email, phone=order.phone,
            name=order.customer_name, tx_ref=tx_ref, redirect_url=redirect_url,
            meta={"reference": order.reference},
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't start payment: {exc}") from None
    return {"link": link}


@router.get("/online/verify")
async def online_verify(transaction_id: str, db: Session = Depends(get_db)) -> dict:
    """Verify a Flutterwave transaction on return and mark the order paid."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    try:
        data = await flutterwave.verify(transaction_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't verify payment: {exc}") from None
    status = str(data.get("status", "")).lower()
    reference = (data.get("meta") or {}).get("reference") or str(data.get("tx_ref", "")).split("-")[0]
    if status == "successful" and reference:
        orders_service.update_order(db, reference, "confirmed", "paid")
    return {"status": status or "failed", "reference": reference}


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
