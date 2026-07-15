from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Referral(Base):
    """A credited referral — created when a new order uses someone's referral code."""

    __tablename__ = "referrals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    referrer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    referred_name: Mapped[str] = mapped_column(String(160), default="")
    order_reference: Mapped[str] = mapped_column(String(20), default="", index=True)
    order_total: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    reward: Mapped[int] = mapped_column(Numeric(12, 0), default=0)  # what the referrer earns
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | paid
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
