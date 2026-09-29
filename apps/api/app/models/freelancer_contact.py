from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FreelancerContact(Base):
    """One customer reaching out to a listed freelancer.

    The directory hands a visitor straight to somebody's WhatsApp, phone or
    inbox, which is the point — but it meant the owner had no idea whether the
    page was working. A freelancer could be paying for a listing that nobody
    ever clicked, and nobody could tell.

    This records the hand-off, not the conversation: which freelancer, by which
    channel, when. What is said afterwards happens on the freelancer's own
    phone and is none of the platform's business.
    """

    __tablename__ = "freelancer_contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    freelancer_id: Mapped[int] = mapped_column(
        ForeignKey("freelancers.id", ondelete="CASCADE"), index=True
    )
    # whatsapp | phone | email | portfolio
    channel: Mapped[str] = mapped_column(String(20), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
