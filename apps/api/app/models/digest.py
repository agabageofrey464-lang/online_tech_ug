from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DailyDigest(Base):
    """One record per daily update email, and the marker for what it covered.

    Two jobs. It stops a second send on the same day — the worker wakes every
    hour and a restart must not mean another mail — and it remembers how far
    the last one got, so tomorrow's only carries what has appeared since.

    Products and courses have no created_at, so "new" is anything with an id
    above the highest we have already written about. Ids are handed out in
    order, so that holds without touching those tables.
    """

    __tablename__ = "daily_digests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sent_on: Mapped[date] = mapped_column(Date, unique=True, index=True)
    subject: Mapped[str] = mapped_column(String(300), default="")
    recipients: Mapped[int] = mapped_column(Integer, default=0)
    # How far this digest had read, so the next one starts after it.
    last_product_id: Mapped[int] = mapped_column(Integer, default=0)
    last_course_id: Mapped[int] = mapped_column(Integer, default=0)
    last_post_id: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
