"""Product reviews — written by customers, about things they actually bought.

A review needs the reference of an order that contained the product, so every
one of them is a verified purchase. Nothing is public until the owner approves
it; the averages and counts the storefront shows are of approved reviews only.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core import ratelimit
from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.review import Review

router = APIRouter()

TOO_MANY = "Too many attempts. Please wait a few minutes and try again."


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class ReviewIn(BaseModel):
    product_slug: str = Field(min_length=1, max_length=160)
    order_reference: str = Field(min_length=4, max_length=20)
    name: str = Field(min_length=1, max_length=80)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=1500)


def _public(r: Review) -> dict:
    return {
        "id": r.id,
        # First name only — a review is not a reason to publish someone's full name.
        "name": r.name.strip().split(" ")[0],
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at,
    }


@router.post("", status_code=201)
def add_review(payload: ReviewIn, request: Request, db: Session = Depends(get_db)) -> dict:
    """Public: review a product from one of your orders. Held until approved."""
    # Checking a reference against a product is also a way to guess references,
    # so wrong ones are counted against the connecting address, as on tracking.
    misses = f"review-miss:{ratelimit.peer_ip(request)}"
    if ratelimit.exceeded(misses, limit=15, window_seconds=600):
        raise HTTPException(status_code=429, detail=TOO_MANY)
    if not ratelimit.allow(f"review:{ratelimit.client_ip(request)}", limit=10, window_seconds=3600):
        raise HTTPException(status_code=429, detail=TOO_MANY)

    reference = payload.order_reference.strip().upper()
    bought = db.scalar(
        select(OrderItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.reference == reference, OrderItem.product_slug == payload.product_slug)
        .where(Order.status != "cancelled")
    )
    if not bought:
        ratelimit.allow(misses, limit=15, window_seconds=600)
        raise HTTPException(
            status_code=400,
            detail="We couldn't find this product on that order. Check the order number on your confirmation.",
        )

    review = Review(
        product_slug=payload.product_slug,
        order_reference=reference,
        name=payload.name.strip(),
        rating=payload.rating,
        comment=payload.comment.strip(),
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="This order has already reviewed this product.") from exc
    return {"ok": True, "status": "pending"}


@router.get("/summary")
def summary(db: Session = Depends(get_db)) -> dict:
    """Public: average and count of approved reviews, for every product that has any."""
    rows = db.execute(
        select(Review.product_slug, func.avg(Review.rating), func.count(Review.id))
        .where(Review.status == "approved")
        .group_by(Review.product_slug)
    ).all()
    return {slug: {"average": round(float(avg), 1), "count": int(n)} for slug, avg, n in rows}


@router.get("")
def product_reviews(product: str, db: Session = Depends(get_db)) -> list[dict]:
    """Public: the approved reviews of one product, newest first."""
    rows = db.scalars(
        select(Review)
        .where(Review.product_slug == product, Review.status == "approved")
        .order_by(Review.created_at.desc())
        .limit(100)
    ).all()
    return [_public(r) for r in rows]


@router.get("/admin", dependencies=[Depends(require_admin)])
def all_reviews(db: Session = Depends(get_db)) -> list[dict]:
    """Admin: every review, pending first."""
    rows = db.scalars(select(Review).order_by(Review.status.desc(), Review.created_at.desc()).limit(500)).all()
    return [
        {**_public(r), "name": r.name, "product_slug": r.product_slug, "order_reference": r.order_reference, "status": r.status}
        for r in rows
    ]


@router.post("/{review_id}/approve", dependencies=[Depends(require_admin)])
def approve(review_id: int, db: Session = Depends(get_db)) -> dict:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = "approved"
    db.commit()
    return {"ok": True}


@router.delete("/{review_id}", dependencies=[Depends(require_admin)])
def remove(review_id: int, db: Session = Depends(get_db)) -> dict:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"ok": True}
