from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Application(Base):
    """A job application submitted from the careers page (with an optional CV file)."""

    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    job_title: Mapped[str] = mapped_column(String(200), default="")
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(200), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    cv_filename: Mapped[str] = mapped_column(String(300), default="")  # stored file name
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | reviewed | shortlisted | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
