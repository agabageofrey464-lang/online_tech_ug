from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app import models

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _count(db: Session, model, *where) -> int:
    stmt = select(func.count()).select_from(model)
    for w in where:
        stmt = stmt.where(w)
    return int(db.execute(stmt).scalar_one())


def _since(value: str | None) -> datetime:
    """When the owner last opened that page; a week ago if never, or unreadable."""
    try:
        t = datetime.fromisoformat((value or "").replace("Z", "+00:00"))
        return t if t.tzinfo else t.replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc) - timedelta(days=7)


@router.get("/counts", dependencies=[Depends(require_admin)])
def counts(
    db: Session = Depends(get_db),
    orders_since: str | None = Query(default=None),
    enrollments_since: str | None = Query(default=None),
) -> dict:
    """Active/pending counts per admin section for sidebar badges.

    Each value is the number worth acting on (pending items where that makes
    sense, otherwise the total). 0 means nothing there yet.
    """
    U = models.User
    o_since = _since(orders_since)
    # Unlock codes keep their time without a zone, in UTC.
    e_since = _since(enrollments_since).astimezone(timezone.utc).replace(tzinfo=None)
    return {
        # Only what arrived since the owner last opened Orders or Enrollments:
        # the sidebar marks what is new, not everything still on the books.
        "orders_new": _count(db, models.Order, models.Order.created_at > o_since),
        "enrollments_new": _count(db, models.UnlockCode, models.UnlockCode.created_at > e_since),
        "products": _count(db, models.Product),
        "inventory": _count(db, models.Product),
        "orders": _count(db, models.Order, models.Order.status == "pending"),
        "coupons": _count(db, models.Coupon, models.Coupon.active.is_(True)),
        "courses": _count(db, models.Course),
        "enrollments": _count(db, models.UnlockCode),
        "vendors": _count(db, U, U.role == "vendor"),
        "referrals": _count(db, models.Referral, models.Referral.status == "pending"),
        "jobs": _count(db, models.Job, models.Job.is_open.is_(True)),
        "applications": _count(db, models.Application, models.Application.status == "new"),
        "adverts": _count(db, models.Advert, models.Advert.active.is_(True)),
        "posts": _count(db, models.Post),
        "freelancers": _count(db, models.Freelancer),
        "leads": _count(db, models.ContactMessage),
        "payments": _count(db, models.Payment, models.Payment.status == "pending"),
        "reviews": _count(db, models.Review, models.Review.status == "pending"),
    }
