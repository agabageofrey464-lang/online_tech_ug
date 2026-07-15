from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
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
    # Owner approval: products are hidden from the marketplace until the admin approves.
    approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
