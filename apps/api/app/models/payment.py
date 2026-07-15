from datetime import datetime

from sqlalchemy import DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Payment(Base):
    """A payment reported by a customer/vendor/advertiser (Mobile Money etc.).

    Recorded from a "confirm payment" form so the owner can arrange & reconcile
    payments in the admin dashboard — no MoMo API integration required.
    """

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    payer_name: Mapped[str] = mapped_column(String(160), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    amount: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    purpose: Mapped[str] = mapped_column(String(120), default="")  # what it's for (plan/advert/etc.)
    method: Mapped[str] = mapped_column(String(40), default="MTN Mobile Money")
    txn_ref: Mapped[str] = mapped_column(String(120), default="")  # MoMo transaction ID
    note: Mapped[str] = mapped_column(String(300), default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | confirmed | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
