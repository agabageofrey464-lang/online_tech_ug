from sqlalchemy import JSON, Boolean, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    category: Mapped[str] = mapped_column(String(80), index=True)
    brand: Mapped[str] = mapped_column(String(80), default="")
    condition: Mapped[str] = mapped_column(String(40), default="Brand New")
    description: Mapped[str] = mapped_column(Text, default="")
    price_ugx: Mapped[int] = mapped_column(Numeric(12, 0))
    old_price_ugx: Mapped[int | None] = mapped_column(Numeric(12, 0), nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(2, 1), default=0)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[str] = mapped_column(String(500), default="")

    # Structured specifications (type, processor, generation, ram, storage,
    # graphics, display, os, battery, ports, build, purpose). Null for non-computers.
    specs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
