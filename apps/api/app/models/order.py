from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    # Customer (guest checkout — Phase 2 has no login yet)
    customer_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(40))
    email: Mapped[str] = mapped_column(String(200), default="")

    # Delivery
    delivery_town: Mapped[str] = mapped_column(String(120), default="")
    delivery_address: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")

    # Money (all in UGX)
    subtotal: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    delivery_fee: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    total: Mapped[int] = mapped_column(Numeric(12, 0), default=0)

    # Payment & fulfilment
    payment_method: Mapped[str] = mapped_column(String(40), default="cash_on_delivery")
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    status: Mapped[str] = mapped_column(String(20), default="pending")

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)

    product_slug: Mapped[str] = mapped_column(String(160))
    name: Mapped[str] = mapped_column(String(200))
    unit_price: Mapped[int] = mapped_column(Numeric(12, 0))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    line_total: Mapped[int] = mapped_column(Numeric(12, 0))

    order: Mapped["Order"] = relationship(back_populates="items")
