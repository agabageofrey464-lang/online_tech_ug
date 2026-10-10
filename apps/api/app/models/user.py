from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    """A customer or vendor account. role = 'customer' | 'vendor' | 'admin'."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(40), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="customer", index=True)

    # Vendor-only fields
    business_name: Mapped[str] = mapped_column(String(160), default="")
    business_category: Mapped[str] = mapped_column(String(80), default="")
    location: Mapped[str] = mapped_column(String(120), default="")
    vendor_approved: Mapped[bool] = mapped_column(Boolean, default=False)

    # Affiliate: unique code this user shares to refer others.
    referral_code: Mapped[str] = mapped_column(String(24), default="", index=True)

    # Vendor KYC / verification
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    id_number: Mapped[str] = mapped_column(String(60), default="")
    business_reg: Mapped[str] = mapped_column(String(80), default="")
    id_doc_filename: Mapped[str] = mapped_column(String(300), default="")

    # Email verification (6-digit code emailed on sign-up)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verify_code: Mapped[str] = mapped_column(String(10), default="")
    verify_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Two-factor auth (email OTP on login, opt-in)
    twofa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    twofa_code: Mapped[str] = mapped_column(String(10), default="")
    twofa_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # When a vendor's paid subscription ends (null = no expiry set).
    subscription_ends: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # When the period they last paid for began: sales are counted from here.
    subscription_started: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # True while a vendor is on the free month given after a paid period
    # in which nothing sold. Cleared when they next pay.
    subscription_grace: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
