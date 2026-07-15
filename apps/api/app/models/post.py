from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Post(Base):
    """A blog / technology-news article managed from the admin panel."""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240), index=True)
    type: Mapped[str] = mapped_column(String(20), default="blog", index=True)  # "blog" | "news"
    category: Mapped[str] = mapped_column(String(60), default="Technology News")
    excerpt: Mapped[str] = mapped_column(String(400), default="")
    body: Mapped[str] = mapped_column(Text, default="")  # paragraphs separated by blank lines
    image_url: Mapped[str] = mapped_column(String(500), default="")
    author: Mapped[str] = mapped_column(String(120), default="Online Tech Uganda")
    published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
