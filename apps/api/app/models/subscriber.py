import secrets
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def _token() -> str:
    return secrets.token_urlsafe(24)


class Subscriber(Base):
    """Someone who asked to hear about new stock, offers and discounts.

    Sources: the storefront newsletter box, checkout opt-in, or an account
    signup. Every subscriber gets a permanent unsubscribe token so every mail we
    send can carry a working one-click opt-out.
    """

    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), default="")
    source: Mapped[str] = mapped_column(String(40), default="website")  # website | checkout | account
    unsubscribe_token: Mapped[str] = mapped_column(String(64), default=_token, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    last_sent: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    send_count: Mapped[int] = mapped_column(Integer, default=0)
