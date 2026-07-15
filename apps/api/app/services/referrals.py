"""Affiliate / referral logic.

Each user gets a shareable referral code. When a new order is placed with that
code, the referrer earns a reward (a % of the order total).
"""

import re
import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.referral import Referral
from app.models.user import User

REWARD_RATE = 0.03  # 3% of order total credited to the referrer

_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous chars


def _rand(n: int = 4) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(n))


def generate_code(db: Session, name: str) -> str:
    """A readable, unique referral code, e.g. AGABA-K7Q9."""
    prefix = re.sub(r"[^A-Za-z0-9]", "", (name or "OTU").upper())[:6] or "OTU"
    while True:
        code = f"{prefix}-{_rand(4)}"
        if not db.execute(select(User).where(User.referral_code == code)).scalar_one_or_none():
            return code


def ensure_code(db: Session, user: User) -> str:
    """Guarantee the user has a referral code (generates one on first use)."""
    if not user.referral_code:
        user.referral_code = generate_code(db, user.name)
        db.commit()
    return user.referral_code


def credit_referral(db: Session, code: str, order: Order) -> Referral | None:
    """Create a referral credit for a new order that used `code`. No-op if invalid."""
    code = (code or "").strip().upper()
    if not code:
        return None
    referrer = db.execute(select(User).where(User.referral_code == code)).scalar_one_or_none()
    if not referrer:
        return None
    # Don't credit a self-referral (buyer email matches the referrer).
    if order.email and referrer.email and order.email.lower() == referrer.email.lower():
        return None
    reward = round(int(order.total) * REWARD_RATE)
    row = Referral(
        referrer_id=referrer.id,
        referred_name=order.customer_name,
        order_reference=order.reference,
        order_total=int(order.total),
        reward=reward,
        status="pending",
    )
    db.add(row)
    db.commit()
    return row


def my_summary(db: Session, user: User) -> dict:
    """The signed-in user's referral code, earnings and history."""
    code = ensure_code(db, user)
    rows = db.execute(
        select(Referral).where(Referral.referrer_id == user.id).order_by(Referral.created_at.desc())
    ).scalars().all()
    total = sum(int(r.reward) for r in rows)
    paid = sum(int(r.reward) for r in rows if r.status == "paid")
    referrals = [
        {
            "referred_name": r.referred_name,
            "order_reference": r.order_reference,
            "order_total": int(r.order_total),
            "reward": int(r.reward),
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in rows
    ]
    return {
        "code": code,
        "reward_rate": REWARD_RATE,
        "count": len(rows),
        "total_earned": total,
        "paid": paid,
        "pending": total - paid,
        "referrals": referrals,
    }


# --- Admin ---
def list_all(db: Session, limit: int = 200) -> dict:
    rows = db.execute(
        select(Referral, User.name, User.email, User.referral_code)
        .join(User, User.id == Referral.referrer_id)
        .order_by(Referral.created_at.desc())
        .limit(limit)
    ).all()
    items = [
        {
            "id": r.id,
            "referrer_name": name,
            "referrer_email": email,
            "referrer_code": rcode,
            "referred_name": r.referred_name,
            "order_reference": r.order_reference,
            "order_total": int(r.order_total),
            "reward": int(r.reward),
            "status": r.status,
            "created_at": r.created_at,
        }
        for r, name, email, rcode in rows
    ]
    total_owed = int(
        db.execute(select(func.coalesce(func.sum(Referral.reward), 0)).where(Referral.status == "pending")).scalar_one()
    )
    return {"total_owed": total_owed, "count": len(items), "referrals": items}


def mark_paid(db: Session, referral_id: int) -> bool:
    row = db.get(Referral, referral_id)
    if not row:
        return False
    row.status = "paid"
    db.commit()
    return True
