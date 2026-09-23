from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# NOTE: adding the vendor_id/commission columns to order_items requires an
# alembic migration on the production Postgres (create_all won't ALTER an
# existing table). Local SQLite recreates the table automatically.


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
    discount: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    coupon_code: Mapped[str] = mapped_column(String(40), default="")
    total: Mapped[int] = mapped_column(Numeric(12, 0), default=0)

    # Payment & fulfilment
    # We deliver what has been paid for; nothing is collected on the doorstep.
    payment_method: Mapped[str] = mapped_column(String(40), default="mtn_momo")
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    status: Mapped[str] = mapped_column(String(20), default="pending")

    # Money currency (Ugandan store = UGX). Kept for correct provider requests.
    currency: Mapped[str] = mapped_column(String(8), default="UGX")

    # Pesapal linkage — set when an online payment is started for this order.
    pesapal_tracking_id: Mapped[str] = mapped_column(String(80), default="", index=True)
    pesapal_merchant_reference: Mapped[str] = mapped_column(String(40), default="")

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )


class PaymentTransaction(Base):
    """Audit trail of Pesapal transactions for an order. The IPN/callback upsert
    this by tracking_id so repeated notifications are idempotent."""

    __tablename__ = "payment_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    merchant_reference: Mapped[str] = mapped_column(String(40), index=True)
    tracking_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    amount: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    currency: Mapped[str] = mapped_column(String(8), default="UGX")
    payment_method: Mapped[str] = mapped_column(String(60), default="")
    payment_status: Mapped[str] = mapped_column(String(20), default="PENDING")
    pesapal_response: Mapped[str] = mapped_column(Text, default="")  # raw status JSON (no secrets)


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)

    product_slug: Mapped[str] = mapped_column(String(160))
    name: Mapped[str] = mapped_column(String(200))
    unit_price: Mapped[int] = mapped_column(Numeric(12, 0))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    line_total: Mapped[int] = mapped_column(Numeric(12, 0))

    # Marketplace: set when the item belongs to a vendor (else house catalog).
    vendor_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    commission: Mapped[int] = mapped_column(Numeric(12, 0), default=0)  # platform cut of this line

    order: Mapped["Order"] = relationship(back_populates="items")
