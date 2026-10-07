from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Review(Base):
    """A customer's review of a product they bought.

    Every review is tied to an order that contained the product, so "verified"
    is a fact about the row rather than a word on the page. The storefront used
    to print a review count worked out from the product's name; this is what it
    counts now, and a product nobody has reviewed says so.
    """

    __tablename__ = "reviews"
    # One review per product per order: a customer can change their mind by
    # asking us, not by voting twice.
    __table_args__ = (UniqueConstraint("order_reference", "product_slug", name="uq_review_order_product"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_slug: Mapped[str] = mapped_column(String(160), index=True)
    order_reference: Mapped[str] = mapped_column(String(20), index=True)
    name: Mapped[str] = mapped_column(String(80))  # first name only is shown
    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str] = mapped_column(Text, default="")
    # "pending" until the owner has read it; only "approved" is ever public.
    status: Mapped[str] = mapped_column(String(12), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
