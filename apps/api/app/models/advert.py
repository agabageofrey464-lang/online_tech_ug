from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Advert(Base):
    """A paid advertisement (business, school, institution, company) shown on the site."""

    __tablename__ = "adverts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    advertiser: Mapped[str] = mapped_column(String(160), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    link_url: Mapped[str] = mapped_column(String(500), default="")
    # where it shows: "advertise" (advertisers page), "home" (homepage banner), "sidebar"
    placement: Mapped[str] = mapped_column(String(40), default="advertise", index=True)
    category: Mapped[str] = mapped_column(String(60), default="Business")
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    subscription_ends: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
