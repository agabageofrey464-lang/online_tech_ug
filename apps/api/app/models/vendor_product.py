from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VendorProduct(Base):
    """A product listed by a vendor (separate from the main house catalog)."""

    __tablename__ = "vendor_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(60), default="")
    price_ugx: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str] = mapped_column(String(1000), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    # What a house product carries, so a vendor's listing can be as complete:
    # who made it, what state it is in, what it used to cost, and a
    # specification table. Specs are free rows — [{"label": "Connector",
    # "value": "USB-C"}] — because a phone case, a charger and a pair of
    # earphones have nothing in common to make fixed fields of.
    brand: Mapped[str] = mapped_column(String(80), default="", server_default="")
    condition: Mapped[str] = mapped_column(String(30), default="Brand New", server_default="Brand New")
    old_price_ugx: Mapped[int | None] = mapped_column(Integer, nullable=True)
    specs: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # Owner approval: products are hidden from the marketplace until the admin approves.
    approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
