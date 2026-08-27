from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PushSubscription(Base):
    """A browser/device that agreed to receive push notifications.

    The browser hands us an endpoint URL plus two keys; we push through that
    endpoint. Endpoints are unique per device+browser, so re-subscribing the
    same device just updates the row.
    """

    __tablename__ = "push_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    endpoint: Mapped[str] = mapped_column(Text, unique=True)
    p256dh: Mapped[str] = mapped_column(String(255))
    auth: Mapped[str] = mapped_column(String(255))
    user_agent: Mapped[str] = mapped_column(String(255), default="")
    email: Mapped[str] = mapped_column(String(200), default="")  # if a known customer
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    last_sent: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    send_count: Mapped[int] = mapped_column(Integer, default=0)
