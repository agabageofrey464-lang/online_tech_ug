"""Online Academy endpoints.

Every route that matters checks the caller's role here rather than trusting
the page that called it. A student can only see their own courses, a lecturer
only the courses they teach, and only the owner can change who is what — a
hidden button is not access control.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services import academy

router = APIRouter()


# ── Guards ──────────────────────────────────────────────────────────────────
def require_lecturer(user: User = Depends(get_current_user)) -> User:
    if not academy.is_lecturer(user):
        raise HTTPException(status_code=403, detail="Lecturers only.")
    return user


def require_admin_user(user: User = Depends(get_current_user)) -> User:
    if not academy.is_admin(user):
        raise HTTPException(status_code=403, detail="Administrators only.")
    return user


def require_admin_key(x_admin_key: str = Header(default="")) -> None:
    """The admin app authenticates with a shared key, not a user session."""
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _slugs(db: Session, user: User) -> list[str]:
    return [e["course_slug"] for e in academy.my_courses(db, user.id)]


# ── Schemas ─────────────────────────────────────────────────────────────────
class EnrolIn(BaseModel):
    course_slug: str = Field(min_length=1, max_length=160)
    mode: str = "online"


class ClassIn(BaseModel):
    course_slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    duration_mins: int = 60
    topic: str = ""
    lecturer_id: int | None = None


class ClassPatch(BaseModel):
    title: str | None = None
    topic: str | None = None
    starts_at: datetime | None = None
    duration_mins: int | None = None
    status: str | None = None
    recording_url: str | None = None
    notes_url: str | None = None


class ProgressIn(BaseModel):
    course_slug: str
    lesson_index: int
    done: bool = True


class QuizIn(BaseModel):
    course_slug: str
    score: int
    total: int


class AssignmentIn(BaseModel):
    course_slug: str
    title: str = Field(min_length=1, max_length=200)
    brief: str = ""
    due_at: datetime | None = None
    max_score: int = 100
    attachment: str = ""


class SubmitIn(BaseModel):
    text: str = ""
    attachment: str = ""


class MarkIn(BaseModel):
    score: int
    feedback: str = ""


class MaterialIn(BaseModel):
    course_slug: str
    title: str
    kind: str = "note"
    url: str = ""
    live_class_id: int | None = None


class AnnounceIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = ""
    course_slug: str = ""
    kind: str = "info"


class RoleIn(BaseModel):
    role: str


def _ok(fn, *a, **kw):
    """Turn an AcademyError into a 400 rather than a 500."""
    try:
        return fn(*a, **kw)
    except academy.AcademyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ── Student ─────────────────────────────────────────────────────────────────
@router.get("/me")
def my_academy(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Everything the student dashboard needs, in one request.

    A dashboard that fires eight requests on a phone loads in pieces; this
    loads at once.
    """
    courses = academy.my_courses(db, user.id)
    slugs = [c["course_slug"] for c in courses]

    return {
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
        "courses": [
            {
                **c,
                "progress": academy.progress(db, user.id, c["course_slug"]),
                "quiz": academy.best_quiz(db, user.id, c["course_slug"]),
                "attendance": academy.attendance_summary(db, user.id, c["course_slug"]),
            }
            for c in courses
        ],
        "timetable": academy.timetable(db, course_slugs=slugs),
        "assignments": academy.list_assignments(db, slugs),
        "submissions": academy.my_submissions(db, user.id),
        "materials": academy.list_materials(db, slugs),
        "announcements": academy.announcements(db, slugs),
    }


@router.post("/enrol", status_code=201)
def enrol(payload: EnrolIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return _ok(academy.enrol, db, user.id, payload.course_slug, payload.mode)


@router.post("/progress")
def set_progress(payload: ProgressIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return academy.mark_lesson(db, user.id, payload.course_slug, payload.lesson_index, payload.done)


@router.post("/quiz")
def save_quiz(payload: QuizIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return academy.save_quiz(db, user.id, payload.course_slug, payload.score, payload.total)


@router.post("/assignments/{assignment_id}/submit")
def submit(
    assignment_id: int,
    payload: SubmitIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    return _ok(academy.submit, db, assignment_id, user.id, payload.text, payload.attachment)


# ── The live classroom ──────────────────────────────────────────────────────
@router.get("/classes")
def classes(
    course: str | None = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """A student sees their own timetable; a lecturer sees everything."""
    if academy.is_lecturer(user):
        return academy.timetable(db, course_slugs=[course] if course else None)
    return academy.timetable(db, course_slugs=_slugs(db, user))


@router.post("/classes/{class_id}/join")
def join(class_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Check the person may enter, mark them present, and hand back the room.

    The room name is only returned once this has passed, so it can't be read
    off a page by someone who isn't enrolled.
    """
    info = _ok(academy.join_class, db, class_id, user.id)
    return {
        **info,
        "provider": settings.live_class_provider,
        "domain": settings.live_class_domain,
    }


@router.post("/classes/{class_id}/leave")
def leave(class_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return academy.leave_class(db, class_id, user.id)


# ── Lecturer ────────────────────────────────────────────────────────────────
@router.get("/teaching")
def teaching(user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> dict:
    """The lecturer dashboard in one request."""
    return {
        "user": {"id": user.id, "name": user.name, "role": user.role},
        "classes": academy.timetable(db, lecturer_id=user.id, upcoming_only=False),
        "all_classes": academy.timetable(db, upcoming_only=False) if academy.is_admin(user) else [],
    }


@router.post("/classes", status_code=201)
def create_class(payload: ClassIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> dict:
    return _ok(
        academy.schedule_class,
        db,
        course_slug=payload.course_slug,
        title=payload.title,
        starts_at=payload.starts_at,
        duration_mins=payload.duration_mins,
        topic=payload.topic,
        lecturer_id=payload.lecturer_id or user.id,
    )


@router.patch("/classes/{class_id}")
def patch_class(
    class_id: int,
    payload: ClassPatch,
    user: User = Depends(require_lecturer),
    db: Session = Depends(get_db),
) -> dict:
    return _ok(academy.update_class, db, class_id, **payload.model_dump(exclude_none=True))


@router.post("/classes/{class_id}/start")
def start(class_id: int, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> dict:
    return _ok(academy.start_class, db, class_id)


@router.post("/classes/{class_id}/end")
def end(class_id: int, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> dict:
    return _ok(academy.end_class, db, class_id)


@router.get("/classes/{class_id}/register")
def class_register(class_id: int, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> list[dict]:
    return academy.register(db, class_id)


@router.post("/attendance/{attendance_id}")
def mark_attendance(
    attendance_id: int,
    status: str = Query(...),
    user: User = Depends(require_lecturer),
    db: Session = Depends(get_db),
) -> dict:
    return _ok(academy.set_attendance, db, attendance_id, status)


@router.get("/courses/{course_slug}/students")
def students(course_slug: str, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> list[dict]:
    return academy.course_students(db, course_slug)


@router.post("/assignments", status_code=201)
def new_assignment(
    payload: AssignmentIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> dict:
    return _ok(academy.create_assignment, db, **payload.model_dump(), lecturer_id=user.id)


@router.get("/assignments/{assignment_id}/submissions")
def submissions(
    assignment_id: int, user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> list[dict]:
    return academy.submissions_for(db, assignment_id)


@router.post("/submissions/{submission_id}/mark")
def mark_submission(
    submission_id: int,
    payload: MarkIn,
    user: User = Depends(require_lecturer),
    db: Session = Depends(get_db),
) -> dict:
    return _ok(academy.mark, db, submission_id, payload.score, payload.feedback)


@router.post("/materials", status_code=201)
def new_material(
    payload: MaterialIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> dict:
    return _ok(academy.add_material, db, **payload.model_dump(), uploaded_by=user.id)


@router.post("/announcements", status_code=201)
def new_announcement(
    payload: AnnounceIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> dict:
    return _ok(academy.announce, db, **payload.model_dump(), author_id=user.id)


# ── Owner / admin app (shared-key auth) ─────────────────────────────────────
@router.get("/admin/people", dependencies=[Depends(require_admin_key)])
def admin_people(role: str | None = Query(default=None), db: Session = Depends(get_db)) -> list[dict]:
    return academy.list_people(db, role)


@router.post("/admin/people/{user_id}/role", dependencies=[Depends(require_admin_key)])
def admin_set_role(user_id: int, payload: RoleIn, db: Session = Depends(get_db)) -> dict:
    return _ok(academy.set_role, db, user_id, payload.role)


@router.get("/admin/classes", dependencies=[Depends(require_admin_key)])
def admin_classes(db: Session = Depends(get_db)) -> list[dict]:
    return academy.timetable(db, upcoming_only=False, limit=200)


@router.post("/admin/classes", status_code=201, dependencies=[Depends(require_admin_key)])
def admin_create_class(payload: ClassIn, db: Session = Depends(get_db)) -> dict:
    return _ok(
        academy.schedule_class,
        db,
        course_slug=payload.course_slug,
        title=payload.title,
        starts_at=payload.starts_at,
        duration_mins=payload.duration_mins,
        topic=payload.topic,
        lecturer_id=payload.lecturer_id,
    )


@router.patch("/admin/classes/{class_id}", dependencies=[Depends(require_admin_key)])
def admin_patch_class(class_id: int, payload: ClassPatch, db: Session = Depends(get_db)) -> dict:
    return _ok(academy.update_class, db, class_id, **payload.model_dump(exclude_none=True))


@router.get("/admin/classes/{class_id}/register", dependencies=[Depends(require_admin_key)])
def admin_register(class_id: int, db: Session = Depends(get_db)) -> list[dict]:
    return academy.register(db, class_id)


@router.get("/admin/enrolments", dependencies=[Depends(require_admin_key)])
def admin_enrolments(course: str = Query(...), db: Session = Depends(get_db)) -> list[dict]:
    return academy.course_students(db, course)


@router.post("/admin/enrolments/{enrolment_id}", dependencies=[Depends(require_admin_key)])
def admin_set_enrolment(
    enrolment_id: int, status: str = Query(...), db: Session = Depends(get_db)
) -> dict:
    return _ok(academy.set_enrolment_status, db, enrolment_id, status)


@router.post("/admin/announcements", status_code=201, dependencies=[Depends(require_admin_key)])
def admin_announce(payload: AnnounceIn, db: Session = Depends(get_db)) -> dict:
    return _ok(academy.announce, db, **payload.model_dump())
