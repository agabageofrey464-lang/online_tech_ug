from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LessonStatus(Base):
    """Whether a single lesson is cleared to be sold and watched.

    The storefront lists 269 lessons and offers each one for UGX 5,000 to
    8,000. Eleven of them have a video. The rest opened a player that said the
    video was coming and the written notes "cover this lesson in full" — which
    for Microsoft Word meant three note units standing in for ten lessons.
    Somebody paid for that.

    So a lesson is not purchasable until the owner has looked at it and said it
    is ready. A row here is that decision. No row means not published, which is
    the safe default: a lesson nobody has checked cannot be sold.

    Keyed by course slug and the lesson's position in the course, because
    lessons live in the shop front's course file rather than in a table of
    their own.
    """

    __tablename__ = "lesson_status"
    __table_args__ = (UniqueConstraint("course_slug", "lesson_index", name="uq_lesson_slug_index"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)
    #: Zero-based position in the course's `lessons` array.
    lesson_index: Mapped[int] = mapped_column(Integer)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    #: Why the owner cleared or held it — shown back to them in the admin.
    note: Mapped[str] = mapped_column(String(300), default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
