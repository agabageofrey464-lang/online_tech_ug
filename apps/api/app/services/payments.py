"""Reported payments (Mobile Money) — recorded for admin reconciliation."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.payment import Payment


def _to_dict(p: Payment) -> dict:
    return {
        "id": p.id, "payer_name": p.payer_name, "phone": p.phone, "amount": int(p.amount),
        "purpose": p.purpose, "method": p.method, "txn_ref": p.txn_ref, "note": p.note,
        "status": p.status, "created_at": p.created_at,
    }


def create(db: Session, data: dict) -> Payment:
    row = Payment(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_payments(db: Session) -> dict:
    rows = db.execute(select(Payment).order_by(Payment.created_at.desc())).scalars().all()
    confirmed = int(
        db.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "confirmed")).scalar_one()
    )
    pending_n = sum(1 for r in rows if r.status == "pending")
    return {"total_confirmed": confirmed, "pending": pending_n, "count": len(rows),
            "payments": [_to_dict(r) for r in rows]}


def set_status(db: Session, payment_id: int, status: str) -> bool:
    row = db.get(Payment, payment_id)
    if not row:
        return False
    row.status = status
    db.commit()
    return True
