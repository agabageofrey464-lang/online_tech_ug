"""The Online Academy: enrolments, live classes, attendance and coursework.

Built on what the site already had rather than beside it. Courses stay in the
`courses` table, people stay in `users` (a lecturer is a user with role
'lecturer'), and paid access still runs through `unlock_codes`. What was
missing was everything that makes a course a class: who is enrolled, when it
meets, who turned up, and what they were set to do.

Progress used to live in the browser's localStorage, which means it belonged
to a device rather than a student — lost on a new phone, and invisible to the
lecturer who needs to see who is falling behind. LessonProgress puts it on the
server, where both of those stop being true.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Enrolment(Base):
    """A student on a course — the record a timetable and a register hang off."""

    __tablename__ = "academy_enrolments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)

    # 'pending' until the owner approves payment, then 'active'. 'completed'
    # once the course is finished, which is what a certificate is issued off.
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    mode: Mapped[str] = mapped_column(String(20), default="online")  # online | physical
    lecturer_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LiveClass(Base):
    """A scheduled session, and the room it meets in.

    `room` is the key to the video call. It is generated once and never
    changes, so a link shared on Monday still works on Friday, and the
    provider can be swapped without the timetable knowing.
    """

    __tablename__ = "academy_live_classes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)
    lecturer_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(200))
    topic: Mapped[str] = mapped_column(Text, default="")
    room: Mapped[str] = mapped_column(String(80), unique=True, index=True)

    starts_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    duration_mins: Mapped[int] = mapped_column(Integer, default=60)

    # scheduled | live | ended | cancelled
    status: Mapped[str] = mapped_column(String(20), default="scheduled", index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    recording_url: Mapped[str] = mapped_column(String(500), default="")
    notes_url: Mapped[str] = mapped_column(String(500), default="")


class ClassAttendance(Base):
    """Who joined a live class, and for how long.

    Written when a student enters the room and updated when they leave, so
    attendance is what actually happened rather than what was ticked.
    """

    __tablename__ = "academy_attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    live_class_id: Mapped[int] = mapped_column(
        ForeignKey("academy_live_classes.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    left_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    minutes: Mapped[int] = mapped_column(Integer, default=0)
    # present | late | absent — set by the lecturer, or worked out from minutes.
    status: Mapped[str] = mapped_column(String(20), default="present")


class Assignment(Base):
    """Work set on a course, with a deadline."""

    __tablename__ = "academy_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)
    lecturer_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    title: Mapped[str] = mapped_column(String(200))
    brief: Mapped[str] = mapped_column(Text, default="")
    attachment: Mapped[str] = mapped_column(String(300), default="")
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    max_score: Mapped[int] = mapped_column(Integer, default=100)
    published: Mapped[bool] = mapped_column(Boolean, default=True)


class Submission(Base):
    """A student's answer to an assignment, and what it was marked."""

    __tablename__ = "academy_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assignment_id: Mapped[int] = mapped_column(
        ForeignKey("academy_assignments.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    text: Mapped[str] = mapped_column(Text, default="")
    attachment: Mapped[str] = mapped_column(String(300), default="")
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str] = mapped_column(Text, default="")
    marked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class LessonProgress(Base):
    """One lesson, one student, done or not.

    The same information localStorage held, but on the server, so it survives
    a new phone and the lecturer can see it.
    """

    __tablename__ = "academy_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)
    lesson_index: Mapped[int] = mapped_column(Integer)

    done: Mapped[bool] = mapped_column(Boolean, default=True)
    done_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class QuizAttempt(Base):
    """A sat quiz, kept so a mark can be shown and disputed."""

    __tablename__ = "academy_quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)

    score: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    taken_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Announcement(Base):
    """Something the academy needs everyone, or one course, to know."""

    __tablename__ = "academy_announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Empty course_slug = everyone.
    course_slug: Mapped[str] = mapped_column(String(160), default="", index=True)
    author_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text, default="")
    # info | urgent — urgent is what a cancelled class is.
    kind: Mapped[str] = mapped_column(String(20), default="info")
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ClassMaterial(Base):
    """Notes and recordings attached to a course or a single class."""

    __tablename__ = "academy_materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_slug: Mapped[str] = mapped_column(String(160), index=True)
    live_class_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    uploaded_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    title: Mapped[str] = mapped_column(String(200))
    # note | recording | slide | resource
    kind: Mapped[str] = mapped_column(String(20), default="note", index=True)
    url: Mapped[str] = mapped_column(String(500), default="")
    size_kb: Mapped[int] = mapped_column(Numeric(10, 0), default=0)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
