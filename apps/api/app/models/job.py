from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Job(Base):
    """A job / internship posting managed from the admin panel."""

    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    type: Mapped[str] = mapped_column(String(40), default="Full-time")  # Full-time/Internship/Part-time/Contract
    category: Mapped[str] = mapped_column(String(60), default="Software")
    location: Mapped[str] = mapped_column(String(120), default="Kampala")
    summary: Mapped[str] = mapped_column(Text, default="")
    requirements: Mapped[list | None] = mapped_column(JSON, nullable=True)  # ["req1", "req2", ...]
    openings: Mapped[int] = mapped_column(Integer, default=1)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
