"""Coupon / discount code logic."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coupon import Coupon


def _compute_discount(coupon: Coupon, subtotal: int) -> int:
    if coupon.discount_type == "fixed":
        return min(int(coupon.value), subtotal)
    # percent
    return int(round(subtotal * min(int(coupon.value), 100) / 100))


def validate(db: Session, code: str, subtotal: int) -> dict:
    """Return {valid, discount, code, message} for a code against a subtotal."""
    code = (code or "").strip().upper()
    if not code:
        return {"valid": False, "discount": 0, "code": "", "message": "Enter a code"}
    coupon = db.execute(select(Coupon).where(Coupon.code == code)).scalar_one_or_none()
    if not coupon or not coupon.active:
        return {"valid": False, "discount": 0, "code": code, "message": "Invalid or inactive code"}
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return {"valid": False, "discount": 0, "code": code, "message": "This code has expired"}
    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        return {"valid": False, "discount": 0, "code": code, "message": "This code has reached its limit"}
    if subtotal < int(coupon.min_subtotal):
        return {"valid": False, "discount": 0, "code": code,
                "message": f"Minimum order of UGX {int(coupon.min_subtotal):,} required"}
    discount = _compute_discount(coupon, subtotal)
    return {"valid": True, "discount": discount, "code": code, "message": "Code applied"}


def redeem(db: Session, code: str, subtotal: int) -> tuple[int, str]:
    """Apply a code to an order at creation time. Returns (discount, normalized_code).

    Increments the usage counter when valid; returns (0, "") when not applicable.
    """
    result = validate(db, code, subtotal)
    if not result["valid"]:
        return 0, ""
    coupon = db.execute(select(Coupon).where(Coupon.code == result["code"])).scalar_one_or_none()
    if coupon:
        coupon.used_count += 1
    return int(result["discount"]), result["code"]


# --- Admin CRUD ---
def list_coupons(db: Session) -> list[Coupon]:
    return list(db.execute(select(Coupon).order_by(Coupon.created_at.desc())).scalars().all())


def create(db: Session, data: dict) -> Coupon:
    data = {**data, "code": data["code"].strip().upper()}
    row = Coupon(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete(db: Session, coupon_id: int) -> bool:
    row = db.get(Coupon, coupon_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True
