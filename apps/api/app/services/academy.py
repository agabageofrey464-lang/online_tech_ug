"""The rules of the Online Academy.

Roles come from the existing `users.role` column: 'student', 'lecturer',
'admin'. Anyone who registers is a customer until someone says otherwise, and
a customer who enrols becomes a student — nobody has to create a second
account to learn here.

The live classroom is deliberately not built here. Video, audio, screen
sharing and recording need a media server, TURN for the phones behind NAT,
and something to record with; writing that would be a year of work and worse
than what exists. What this does instead is own the part that is ours — who
may enter a room, when it opens, and who actually turned up — and hand the
call itself to a provider through a room name it controls.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.academy import (
    Announcement,
    Assignment,
    ClassAttendance,
    ClassMaterial,
    Enrolment,
    LessonProgress,
    LiveClass,
    QuizAttempt,
    Submission,
)
from app.models.user import User

# A class opens this long before its start, so nobody is locked out of their
# own lesson by a slow phone clock, and stays open this long after it ends.
DOORS_OPEN_MINS = 15
DOORS_CLOSE_MINS = 30


class AcademyError(Exception):
    """Something the caller did wrong — becomes a 400."""


# ── Roles ───────────────────────────────────────────────────────────────────
ROLES = ("student", "lecturer", "admin")


def is_lecturer(user: User) -> bool:
    return user.role in ("lecturer", "admin")


def is_admin(user: User) -> bool:
    return user.role == "admin"


def set_role(db: Session, user_id: int, role: str) -> dict:
    if role not in ROLES and role != "customer":
        raise AcademyError(f"Unknown role: {role}")
    user = db.get(User, user_id)
    if not user:
        raise AcademyError("No such user")
    user.role = role
    db.commit()
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


def list_people(db: Session, role: str | None = None) -> list[dict]:
    stmt = select(User).order_by(User.name)
    if role:
        stmt = stmt.where(User.role == role)
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "active": u.is_active,
        }
        for u in db.execute(stmt).scalars().all()
    ]


# ── Enrolment ───────────────────────────────────────────────────────────────
def enrol(db: Session, user_id: int, course_slug: str, mode: str = "online") -> dict:
    """Put a student on a course. Enrolling twice is not an error."""
    existing = db.execute(
        select(Enrolment).where(
            Enrolment.user_id == user_id, Enrolment.course_slug == course_slug
        )
    ).scalar_one_or_none()
    if existing:
        return _enrolment_dict(existing)

    row = Enrolment(user_id=user_id, course_slug=course_slug, mode=mode, status="pending")
    db.add(row)

    # Someone learning here is a student, unless they already run the place.
    user = db.get(User, user_id)
    if user and user.role == "customer":
        user.role = "student"

    db.commit()
    db.refresh(row)
    return _enrolment_dict(row)


def set_enrolment_status(db: Session, enrolment_id: int, status: str) -> dict:
    row = db.get(Enrolment, enrolment_id)
    if not row:
        raise AcademyError("No such enrolment")
    row.status = status
    if status == "completed" and not row.completed_at:
        row.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _enrolment_dict(row)


def my_courses(db: Session, user_id: int) -> list[dict]:
    rows = db.execute(
        select(Enrolment).where(Enrolment.user_id == user_id).order_by(Enrolment.enrolled_at.desc())
    ).scalars().all()
    return [_enrolment_dict(r) for r in rows]


def course_students(db: Session, course_slug: str) -> list[dict]:
    rows = db.execute(
        select(Enrolment, User)
        .join(User, User.id == Enrolment.user_id)
        .where(Enrolment.course_slug == course_slug)
        .order_by(User.name)
    ).all()
    return [
        {
            **_enrolment_dict(e),
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
        }
        for e, u in rows
    ]


def _enrolment_dict(r: Enrolment) -> dict:
    return {
        "id": r.id,
        "user_id": r.user_id,
        "course_slug": r.course_slug,
        "status": r.status,
        "mode": r.mode,
        "lecturer_id": r.lecturer_id,
        "enrolled_at": r.enrolled_at.isoformat() if r.enrolled_at else None,
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
    }


def is_enrolled(db: Session, user_id: int, course_slug: str) -> bool:
    return (
        db.execute(
            select(func.count())
            .select_from(Enrolment)
            .where(
                Enrolment.user_id == user_id,
                Enrolment.course_slug == course_slug,
                Enrolment.status.in_(("active", "completed")),
            )
        ).scalar_one()
        > 0
    )


# ── Live classes ────────────────────────────────────────────────────────────
def _room_name(course_slug: str) -> str:
    """A room nobody can guess.

    The name is the only thing standing between a class and someone who
    wandered in, so it carries enough randomness to be unguessable while
    staying readable in a URL.
    """
    return f"otu-{course_slug[:28]}-{secrets.token_hex(5)}"


def schedule_class(
    db: Session,
    *,
    course_slug: str,
    title: str,
    starts_at: datetime,
    duration_mins: int = 60,
    lecturer_id: int | None = None,
    topic: str = "",
) -> dict:
    if not title.strip():
        raise AcademyError("Give the class a title")
    if duration_mins < 5 or duration_mins > 480:
        raise AcademyError("A class runs between 5 minutes and 8 hours")

    row = LiveClass(
        course_slug=course_slug,
        lecturer_id=lecturer_id,
        title=title.strip()[:200],
        topic=topic.strip(),
        room=_room_name(course_slug),
        starts_at=starts_at,
        duration_mins=duration_mins,
        status="scheduled",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return class_dict(db, row)


def update_class(db: Session, class_id: int, **fields) -> dict:
    row = db.get(LiveClass, class_id)
    if not row:
        raise AcademyError("No such class")
    for k in ("title", "topic", "starts_at", "duration_mins", "status", "recording_url", "notes_url"):
        if k in fields and fields[k] is not None:
            setattr(row, k, fields[k])
    db.commit()
    db.refresh(row)
    return class_dict(db, row)


def start_class(db: Session, class_id: int) -> dict:
    row = db.get(LiveClass, class_id)
    if not row:
        raise AcademyError("No such class")
    row.status = "live"
    row.started_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return class_dict(db, row)


def end_class(db: Session, class_id: int) -> dict:
    row = db.get(LiveClass, class_id)
    if not row:
        raise AcademyError("No such class")
    row.status = "ended"
    row.ended_at = datetime.utcnow()

    # Close off anyone the room still thinks is inside.
    now = datetime.utcnow()
    open_rows = db.execute(
        select(ClassAttendance).where(
            ClassAttendance.live_class_id == class_id, ClassAttendance.left_at.is_(None)
        )
    ).scalars().all()
    for a in open_rows:
        a.left_at = now
        a.minutes = max(0, int((now - a.joined_at).total_seconds() // 60))

    db.commit()
    db.refresh(row)
    return class_dict(db, row)


def timetable(
    db: Session,
    *,
    course_slugs: list[str] | None = None,
    lecturer_id: int | None = None,
    upcoming_only: bool = True,
    limit: int = 60,
) -> list[dict]:
    """Classes, soonest first. A class that has just ended still shows, so a
    student who was a minute late can still find the room."""
    stmt = select(LiveClass).order_by(LiveClass.starts_at.asc()).limit(limit)

    if course_slugs is not None:
        if not course_slugs:
            return []
        stmt = stmt.where(LiveClass.course_slug.in_(course_slugs))
    if lecturer_id is not None:
        stmt = stmt.where(LiveClass.lecturer_id == lecturer_id)
    if upcoming_only:
        stmt = stmt.where(
            LiveClass.starts_at >= datetime.utcnow() - timedelta(minutes=DOORS_CLOSE_MINS + 60),
            LiveClass.status != "cancelled",
        )

    return [class_dict(db, r) for r in db.execute(stmt).scalars().all()]


def class_dict(db: Session, row: LiveClass) -> dict:
    lecturer = db.get(User, row.lecturer_id) if row.lecturer_id else None
    return {
        "id": row.id,
        "course_slug": row.course_slug,
        "title": row.title,
        "topic": row.topic,
        "room": row.room,
        "starts_at": row.starts_at.isoformat() if row.starts_at else None,
        "duration_mins": row.duration_mins,
        "status": row.status,
        "lecturer_id": row.lecturer_id,
        "lecturer_name": lecturer.name if lecturer else "",
        "recording_url": row.recording_url,
        "notes_url": row.notes_url,
        "joinable": joinable(row)[0],
        "join_note": joinable(row)[1],
        "attendees": db.execute(
            select(func.count()).select_from(ClassAttendance).where(
                ClassAttendance.live_class_id == row.id
            )
        ).scalar_one(),
    }


def joinable(row: LiveClass) -> tuple[bool, str]:
    """Whether the door is open, and what to tell someone if it isn't."""
    if row.status == "cancelled":
        return False, "This class was cancelled."
    if row.status == "live":
        return True, "In progress — join now."

    now = datetime.utcnow()
    opens = row.starts_at - timedelta(minutes=DOORS_OPEN_MINS)
    closes = row.starts_at + timedelta(minutes=row.duration_mins + DOORS_CLOSE_MINS)

    if now < opens:
        mins = int((opens - now).total_seconds() // 60)
        if mins >= 1440:
            return False, f"Opens in {mins // 1440} day(s)."
        if mins >= 60:
            return False, f"Opens in {mins // 60}h {mins % 60}m."
        return False, f"Opens in {max(1, mins)} minute(s)."
    if now > closes:
        return False, "This class has finished."
    return True, "The room is open."


def join_class(db: Session, class_id: int, user_id: int) -> dict:
    """Let a student in, and mark them present.

    Access is checked here rather than in the page, because a page can be
    edited by the person looking at it and a room name is a password.
    """
    row = db.get(LiveClass, class_id)
    if not row:
        raise AcademyError("No such class")

    user = db.get(User, user_id)
    if not user:
        raise AcademyError("No such user")

    if not is_lecturer(user) and not is_enrolled(db, user_id, row.course_slug):
        raise AcademyError("You are not enrolled on this course.")

    ok, note = joinable(row)
    if not ok and not is_lecturer(user):
        raise AcademyError(note)

    # One attendance row per person per class; re-joining reopens theirs.
    att = db.execute(
        select(ClassAttendance).where(
            ClassAttendance.live_class_id == class_id, ClassAttendance.user_id == user_id
        )
    ).scalar_one_or_none()

    if att is None:
        late = datetime.utcnow() > row.starts_at + timedelta(minutes=10)
        att = ClassAttendance(
            live_class_id=class_id,
            user_id=user_id,
            joined_at=datetime.utcnow(),
            status="late" if late else "present",
        )
        db.add(att)
    else:
        att.left_at = None

    # A lecturer arriving is what starts a class, so nobody has to remember to
    # — but only at its proper time. Opening next week's room to test the link
    # must not mark next week's class as held, or every student on the course
    # is recorded absent from a lesson that never ran.
    if is_lecturer(user) and row.status == "scheduled" and ok:
        row.status = "live"
        row.started_at = datetime.utcnow()

    db.commit()
    db.refresh(row)

    return {
        **class_dict(db, row),
        "display_name": user.name,
        "is_host": is_lecturer(user),
        "attendance_id": att.id,
    }


def leave_class(db: Session, class_id: int, user_id: int) -> dict:
    att = db.execute(
        select(ClassAttendance).where(
            ClassAttendance.live_class_id == class_id, ClassAttendance.user_id == user_id
        )
    ).scalar_one_or_none()
    if not att:
        return {"ok": False}
    now = datetime.utcnow()
    att.left_at = now
    att.minutes = max(0, int((now - att.joined_at).total_seconds() // 60))
    db.commit()
    return {"ok": True, "minutes": att.minutes}


def register(db: Session, class_id: int) -> list[dict]:
    """Who turned up to a class, and for how long."""
    rows = db.execute(
        select(ClassAttendance, User)
        .join(User, User.id == ClassAttendance.user_id)
        .where(ClassAttendance.live_class_id == class_id)
        .order_by(ClassAttendance.joined_at)
    ).all()
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "name": u.name,
            "email": u.email,
            "joined_at": a.joined_at.isoformat() if a.joined_at else None,
            "left_at": a.left_at.isoformat() if a.left_at else None,
            "minutes": a.minutes,
            "status": a.status,
            "in_room": a.left_at is None,
        }
        for a, u in rows
    ]


def set_attendance(db: Session, attendance_id: int, status: str) -> dict:
    row = db.get(ClassAttendance, attendance_id)
    if not row:
        raise AcademyError("No such attendance record")
    row.status = status
    db.commit()
    return {"id": row.id, "status": row.status}


def attendance_summary(db: Session, user_id: int, course_slug: str) -> dict:
    """How much of a course a student has actually attended."""
    held = db.execute(
        select(func.count())
        .select_from(LiveClass)
        .where(
            LiveClass.course_slug == course_slug,
            LiveClass.status.in_(("live", "ended")),
        )
    ).scalar_one()

    attended = db.execute(
        select(func.count())
        .select_from(ClassAttendance)
        .join(LiveClass, LiveClass.id == ClassAttendance.live_class_id)
        .where(LiveClass.course_slug == course_slug, ClassAttendance.user_id == user_id)
    ).scalar_one()

    return {
        "held": held,
        "attended": attended,
        "percent": round(attended * 100 / held) if held else 0,
    }


# ── Progress ────────────────────────────────────────────────────────────────
def mark_lesson(db: Session, user_id: int, course_slug: str, lesson_index: int, done: bool) -> dict:
    row = db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == user_id,
            LessonProgress.course_slug == course_slug,
            LessonProgress.lesson_index == lesson_index,
        )
    ).scalar_one_or_none()

    if row is None:
        row = LessonProgress(
            user_id=user_id, course_slug=course_slug, lesson_index=lesson_index, done=done
        )
        db.add(row)
    else:
        row.done = done
        row.done_at = datetime.utcnow()

    db.commit()
    return {"course_slug": course_slug, "lesson_index": lesson_index, "done": done}


def progress(db: Session, user_id: int, course_slug: str) -> list[int]:
    rows = db.execute(
        select(LessonProgress.lesson_index).where(
            LessonProgress.user_id == user_id,
            LessonProgress.course_slug == course_slug,
            LessonProgress.done.is_(True),
        )
    ).scalars().all()
    return sorted(rows)


def save_quiz(db: Session, user_id: int, course_slug: str, score: int, total: int) -> dict:
    passed = total > 0 and score * 100 / total >= 60
    row = QuizAttempt(
        user_id=user_id, course_slug=course_slug, score=score, total=total, passed=passed
    )
    db.add(row)
    db.commit()
    return {"score": score, "total": total, "passed": passed}


def best_quiz(db: Session, user_id: int, course_slug: str) -> dict | None:
    row = db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == user_id, QuizAttempt.course_slug == course_slug)
        .order_by(QuizAttempt.score.desc())
        .limit(1)
    ).scalar_one_or_none()
    if not row:
        return None
    return {
        "score": row.score,
        "total": row.total,
        "passed": row.passed,
        "taken_at": row.taken_at.isoformat(),
    }


# ── Assignments ─────────────────────────────────────────────────────────────
def create_assignment(db: Session, **fields) -> dict:
    if not (fields.get("title") or "").strip():
        raise AcademyError("Give the assignment a title")
    row = Assignment(
        course_slug=fields["course_slug"],
        lecturer_id=fields.get("lecturer_id"),
        title=fields["title"].strip()[:200],
        brief=(fields.get("brief") or "").strip(),
        attachment=fields.get("attachment") or "",
        due_at=fields.get("due_at"),
        max_score=int(fields.get("max_score") or 100),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return assignment_dict(row)


def list_assignments(db: Session, course_slugs: list[str]) -> list[dict]:
    if not course_slugs:
        return []
    rows = db.execute(
        select(Assignment)
        .where(Assignment.course_slug.in_(course_slugs), Assignment.published.is_(True))
        .order_by(Assignment.due_at.asc().nullslast())
    ).scalars().all()
    return [assignment_dict(r) for r in rows]


def assignment_dict(r: Assignment) -> dict:
    return {
        "id": r.id,
        "course_slug": r.course_slug,
        "title": r.title,
        "brief": r.brief,
        "attachment": r.attachment,
        "due_at": r.due_at.isoformat() if r.due_at else None,
        "max_score": r.max_score,
        "overdue": bool(r.due_at and r.due_at < datetime.utcnow()),
    }


def submit(db: Session, assignment_id: int, user_id: int, text: str, attachment: str = "") -> dict:
    if not text.strip() and not attachment:
        raise AcademyError("Write something or attach a file")

    row = db.execute(
        select(Submission).where(
            Submission.assignment_id == assignment_id, Submission.user_id == user_id
        )
    ).scalar_one_or_none()

    if row is None:
        row = Submission(assignment_id=assignment_id, user_id=user_id)
        db.add(row)

    # Re-submitting before it is marked replaces the earlier attempt; after
    # marking it does not, so a mark can't be quietly rewritten.
    if row.marked_at:
        raise AcademyError("This has already been marked.")

    row.text = text.strip()
    row.attachment = attachment
    row.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return submission_dict(row)


def mark(db: Session, submission_id: int, score: int, feedback: str = "") -> dict:
    row = db.get(Submission, submission_id)
    if not row:
        raise AcademyError("No such submission")
    row.score = score
    row.feedback = feedback.strip()
    row.marked_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return submission_dict(row)


def submissions_for(db: Session, assignment_id: int) -> list[dict]:
    rows = db.execute(
        select(Submission, User)
        .join(User, User.id == Submission.user_id)
        .where(Submission.assignment_id == assignment_id)
        .order_by(Submission.submitted_at.desc())
    ).all()
    return [{**submission_dict(s), "name": u.name, "email": u.email} for s, u in rows]


def my_submissions(db: Session, user_id: int) -> list[dict]:
    rows = db.execute(
        select(Submission).where(Submission.user_id == user_id)
    ).scalars().all()
    return [submission_dict(r) for r in rows]


def submission_dict(r: Submission) -> dict:
    return {
        "id": r.id,
        "assignment_id": r.assignment_id,
        "user_id": r.user_id,
        "text": r.text,
        "attachment": r.attachment,
        "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
        "score": r.score,
        "feedback": r.feedback,
        "marked": r.marked_at is not None,
    }


# ── Materials and announcements ─────────────────────────────────────────────
def add_material(db: Session, **fields) -> dict:
    row = ClassMaterial(
        course_slug=fields["course_slug"],
        live_class_id=fields.get("live_class_id"),
        uploaded_by=fields.get("uploaded_by"),
        title=(fields.get("title") or "Untitled").strip()[:200],
        kind=fields.get("kind") or "note",
        url=fields.get("url") or "",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return material_dict(row)


def list_materials(db: Session, course_slugs: list[str], kind: str | None = None) -> list[dict]:
    if not course_slugs:
        return []
    stmt = select(ClassMaterial).where(ClassMaterial.course_slug.in_(course_slugs))
    if kind:
        stmt = stmt.where(ClassMaterial.kind == kind)
    rows = db.execute(stmt.order_by(ClassMaterial.added_at.desc())).scalars().all()
    return [material_dict(r) for r in rows]


def material_dict(r: ClassMaterial) -> dict:
    return {
        "id": r.id,
        "course_slug": r.course_slug,
        "live_class_id": r.live_class_id,
        "title": r.title,
        "kind": r.kind,
        "url": r.url,
        "added_at": r.added_at.isoformat() if r.added_at else None,
    }


def announce(db: Session, **fields) -> dict:
    row = Announcement(
        course_slug=fields.get("course_slug") or "",
        author_id=fields.get("author_id"),
        title=(fields.get("title") or "").strip()[:200],
        body=(fields.get("body") or "").strip(),
        kind=fields.get("kind") or "info",
    )
    if not row.title:
        raise AcademyError("Give the announcement a title")
    db.add(row)
    db.commit()
    db.refresh(row)
    return announcement_dict(row)


def announcements(db: Session, course_slugs: list[str], limit: int = 20) -> list[dict]:
    """Everything addressed to everyone, plus anything for these courses."""
    stmt = (
        select(Announcement)
        .where(
            (Announcement.course_slug == "")
            | (Announcement.course_slug.in_(course_slugs or [""]))
        )
        .order_by(Announcement.posted_at.desc())
        .limit(limit)
    )
    return [announcement_dict(r) for r in db.execute(stmt).scalars().all()]


def announcement_dict(r: Announcement) -> dict:
    return {
        "id": r.id,
        "course_slug": r.course_slug,
        "title": r.title,
        "body": r.body,
        "kind": r.kind,
        "posted_at": r.posted_at.isoformat() if r.posted_at else None,
    }
