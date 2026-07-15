from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VendorPayout(Base):
    """A payout the platform owner has settled to a vendor (against commission owed)."""

    __tablename__ = "vendor_payouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(40), default="Mobile Money")
    reference: Mapped[str] = mapped_column(String(120), default="")  # MoMo txn id / note
    note: Mapped[str] = mapped_column(String(300), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
