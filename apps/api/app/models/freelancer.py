from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Freelancer(Base):
    """A freelancer listed in the public directory (admin-approved)."""

    __tablename__ = "freelancers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(160), default="")  # e.g. "Web Developer"
    # Prose, not a short field: people paste their whole skill set in here.
    # It was varchar(400) and a 952-character list returned a 500.
    skills: Mapped[str] = mapped_column(Text, default="")  # comma separated
    bio: Mapped[str] = mapped_column(Text, default="")
    rate: Mapped[str] = mapped_column(String(80), default="")  # e.g. "From UGX 50,000/day"
    location: Mapped[str] = mapped_column(String(120), default="Uganda")
    phone: Mapped[str] = mapped_column(String(40), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    portfolio_url: Mapped[str] = mapped_column(String(500), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    subscription_ends: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
