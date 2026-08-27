from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Campaign(Base):
    """A promotion you run yourself — "Storage Week", "Back to School", a flash
    weekend. Unlike an Advert (a paying third party), a campaign is our own offer:
    it has a schedule, a look, and a link into the shop.

    A campaign is LIVE when active is true and now sits inside its window.
    Leaving starts_at/ends_at empty means "no limit on that end".
    """

    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)

    # Copy
    program: Mapped[str] = mapped_column(String(120), default="")   # small label above
    badge: Mapped[str] = mapped_column(String(40), default="")      # big badge word
    badge_sub: Mapped[str] = mapped_column(String(40), default="")  # second badge word
    title: Mapped[str] = mapped_column(String(160))                 # headline
    pill: Mapped[str] = mapped_column(String(120), default="")      # white offer pill
    note: Mapped[str] = mapped_column(String(200), default="")      # supporting line
    small: Mapped[str] = mapped_column(String(80), default="T&Cs Apply")
    cta_label: Mapped[str] = mapped_column(String(60), default="Shop now")
    link_url: Mapped[str] = mapped_column(String(300), default="/shop")

    # Look
    image_url: Mapped[str] = mapped_column(String(500), default="")
    bg_color: Mapped[str] = mapped_column(String(40), default="#6d28d9")
    panel_color: Mapped[str] = mapped_column(String(40), default="#FCDC04")

    # Schedule & placement
    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)  # higher shows first
    placement: Mapped[str] = mapped_column(String(30), default="home", index=True)

    # Optional: headline discount shown on the banner
    discount_pct: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
