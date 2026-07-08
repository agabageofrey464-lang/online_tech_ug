from sqlalchemy import JSON, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    level: Mapped[str] = mapped_column(String(40), default="Beginner")
    lessons: Mapped[int] = mapped_column(Integer, default=0)
    hours: Mapped[int] = mapped_column(Integer, default=0)
    price_ugx: Mapped[int] = mapped_column(Numeric(12, 0), default=0)
    blurb: Mapped[str] = mapped_column(Text, default="")
    emoji: Mapped[str] = mapped_column(String(40), default="learn")
    unlock_code: Mapped[str] = mapped_column(String(60), default="")
    sample_video: Mapped[str] = mapped_column(String(300), default="")

    # JSON blobs mirroring the frontend course model.
    syllabus: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{title,minutes,free,preview,youtube}]
    materials: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{title,file}]
    quiz: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{q,options,answer}]
