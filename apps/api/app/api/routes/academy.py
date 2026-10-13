"""Online Academy endpoints.

Every route that matters checks the caller's role here rather than trusting
the page that called it. A student can only see their own courses, a lecturer
only the courses they teach, and only the owner can change who is what — a
hidden button is not access control.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services import academy, storage

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
    # A private session for one student on the course.
    private_user_id: int | None = None


class ConsultationIn(BaseModel):
    course_slug: str = Field(min_length=1, max_length=160)
    topic: str = Field(min_length=3, max_length=1000)
    preferred_at: datetime


class ConfirmIn(BaseModel):
    starts_at: datetime | None = None
    duration_mins: int | None = None


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


class ExamQuestion(BaseModel):
    q: str
    options: list[str]
    answer: int


class ExamIn(BaseModel):
    course_slug: str
    title: str = Field(min_length=1, max_length=200)
    instructions: str = ""
    duration_minutes: int = 30
    pass_mark: int = 50
    questions: list[ExamQuestion] = Field(default_factory=list, max_length=200)
    opens_at: datetime | None = None
    closes_at: datetime | None = None


class ExamAnswers(BaseModel):
    answers: list[int] = Field(default_factory=list, max_length=200)


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
        "timetable": academy.timetable(db, course_slugs=slugs, viewer_id=user.id),
        "assignments": academy.list_assignments(db, slugs),
        "submissions": academy.my_submissions(db, user.id),
        "materials": academy.list_materials(db, slugs, viewer_id=user.id),
        "announcements": academy.announcements(db, slugs),
        # Examinations on the student's courses — the questions are sent only
        # when they start the clock — and the ones they have sat.
        "exams": academy.list_exams(db, slugs),
        "exam_attempts": academy.my_exam_attempts(db, user.id),
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


@router.post("/exams/{exam_id}/start")
def start_exam(exam_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Start the clock on an examination and receive its questions."""
    return _ok(academy.start_exam, db, exam_id, user.id)


@router.post("/exams/{exam_id}/submit")
def submit_exam(
    exam_id: int, payload: ExamAnswers, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    return _ok(academy.submit_exam, db, exam_id, user.id, payload.answers)


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
    return academy.timetable(db, course_slugs=_slugs(db, user), viewer_id=user.id)


@router.get("/classes/{class_id}/files")
def class_files(class_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    """The notes, slides and recordings shared for a class, to those allowed in it."""
    return _ok(academy.class_files, db, class_id, user.id)


@router.post("/consultations", status_code=201)
def ask_consultation(payload: ConsultationIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """A student asks for a private session with a lecturer."""
    return _ok(academy.request_consultation, db, user.id, payload.course_slug, payload.topic, payload.preferred_at)


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
        # Students waiting for a private session; any lecturer may take one.
        "requests": academy.consultation_requests(db),
    }


@router.post("/consultations/{class_id}/confirm")
def confirm_consultation(
    class_id: int, payload: ConfirmIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> dict:
    """Take a student's request and fix its time."""
    return _ok(academy.confirm_consultation, db, class_id, user.id, payload.starts_at, payload.duration_mins)


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
        private_user_id=payload.private_user_id,
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


@router.get("/assignments")
def course_assignments(
    course: str = Query(...), user: User = Depends(require_lecturer), db: Session = Depends(get_db)
) -> list[dict]:
    """Assignments on a course, for the lecturer marking them.

    /me answers this for a student, but it reads from their enrolments, and a
    lecturer isn't enrolled on the course they teach.
    """
    return academy.list_assignments(db, [course])


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


@router.post("/exams", status_code=201)
def new_exam(payload: ExamIn, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> dict:
    data = payload.model_dump()
    return _ok(academy.create_exam, db, **data, lecturer_id=user.id)


@router.get("/exams")
def course_exams(course: str = Query(...), user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> list[dict]:
    """Examinations on a course, with their answers, for the lecturer."""
    return academy.list_exams(db, [course], for_lecturer=True)


@router.get("/exams/{exam_id}/results")
def exam_results(exam_id: int, user: User = Depends(require_lecturer), db: Session = Depends(get_db)) -> list[dict]:
    return academy.exam_results(db, exam_id)


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


# ── Files ───────────────────────────────────────────────────────────────────
# Notes, slides and a student's submitted work. Kept small and to known types:
# an upload box on a public site is an invitation, and the cheapest way to
# decline it is to accept only what a class actually needs.
ACADEMY_EXT = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
               ".jpg", ".jpeg", ".png", ".webp", ".txt", ".zip"}
MAX_ACADEMY_BYTES = 25 * 1024 * 1024


@router.post("/files", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict:
    """Store a file and hand back the URL to save against a note or submission.

    Any signed-in member of the academy may upload — a student has to be able
    to hand work in — but the row that points at it still has to pass the
    role checks on whichever endpoint records it.
    """
    if user.role not in ("student", "lecturer", "admin"):
        raise HTTPException(status_code=403, detail="Academy members only.")

    content = await file.read()
    try:
        stored = storage.save_file(
            "academy", file.filename or "file", content,
            allowed=ACADEMY_EXT, max_bytes=MAX_ACADEMY_BYTES,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "stored": stored,
        "name": file.filename,
        "url": f"{settings.api_public_url.rstrip('/')}/api/v1/academy/files/{stored}",
        "size_kb": round(len(content) / 1024),
    }


@router.get("/files/{stored}")
def serve_file(stored: str):
    path = storage.file_path("academy", stored)
    if not path:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


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
