from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DiscussionPost(Base):
    """A question or reply in the student community.

    A post with `parent_id` set is a reply; otherwise it starts a thread. Posts
    are tied to a course slug so each course has its own discussion, and every
    post is moderatable — students talk in public, so the owner needs a way to
    take something down.
    """

    __tablename__ = "discussion_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True, default="general")
    parent_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    author_name: Mapped[str] = mapped_column(String(120), default="Student")
    author_email: Mapped[str] = mapped_column(String(200), default="")
    # Ties a post to the browser that wrote it, so a student can delete their own.
    device_token: Mapped[str] = mapped_column(String(64), default="", index=True)

    title: Mapped[str] = mapped_column(String(200), default="")
    body: Mapped[str] = mapped_column(Text)

    is_staff: Mapped[bool] = mapped_column(Boolean, default=False)  # answered by Online Tech
    hidden: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # moderated away
    likes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
