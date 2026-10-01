import json
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from sqlalchemy import select
from pydantic import BaseModel

from app.core.config import settings
from app.models.lesson import LessonStatus
from app.db.session import get_db
from app.schemas.course import CourseOut
from app.services import courses, unlock_codes

router = APIRouter()

# Written course notes live on the SERVER (not in the browser bundle), so the
# full content is only ever sent to a paid learner or the owner.
def require_admin(x_admin_key: str = Header(default="")) -> None:
    """Owner-only. Same shared key the rest of the admin uses."""
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


_NOTES_PATH = Path(__file__).resolve().parents[2] / "data" / "course_notes.json"

# Fixed per-course codes (kept in step with the storefront's course.unlockCode).
_STATIC_CODES = {
    "computer-basics": "CB-2026",
    "microsoft-office": "OFFICE-2026",
    "microsoft-word": "WORD-2026",
    "microsoft-excel": "EXCEL-2026",
    "microsoft-powerpoint": "PPT-2026",
    "microsoft-access": "ACCESS-2026",
    "microsoft-publisher": "PUB-2026",
    "internet-email": "NET-2026",
    "typing-skills": "TYPE-2026",
    "computer-networking": "NETW-2026",
    "python-programming": "PY-2026",
    "web-development": "WEB-2026",
    "cybersecurity-basics": "CYB-2026",
    "digital-marketing": "DM-2026",
    "graphic-design": "GD-2026",
}


def _load_notes() -> dict:
    try:
        return json.loads(_NOTES_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


@router.get("", response_model=list[CourseOut])
def get_courses(db: Session = Depends(get_db)) -> list[dict]:
    """List courses (DB-backed, with seed fallback)."""
    return courses.list_courses(db)


@router.get("/{slug}/notes")
def course_notes(
    slug: str,
    code: str = Query(default=""),
    x_admin_key: str = Header(default=""),
    db: Session = Depends(get_db),
) -> dict:
    """Course notes, gated. Returns the full units only for the owner (admin key)
    or a learner with a valid unlock code; otherwise just unit titles (preview)."""
    units = _load_notes().get(slug)
    if not units:
        raise HTTPException(status_code=404, detail="No notes for this course")

    preview = [{"n": u["n"], "title": u["title"], "summary": u.get("summary", "")} for u in units]

    entered = "".join(code.split()).upper()
    is_owner = bool(settings.admin_api_key) and x_admin_key == settings.admin_api_key
    static_ok = bool(entered) and entered == _STATIC_CODES.get(slug, "").upper()
    db_ok = bool(entered) and not static_ok and unlock_codes.verify_code(db, slug, code).get("valid", False)

    if is_owner or static_ok or db_ok:
        return {"unlocked": True, "units": units}
    return {"unlocked": False, "units": preview}


@router.get("/{slug}", response_model=CourseOut)
def get_course(slug: str, db: Session = Depends(get_db)) -> dict:
    course = courses.get_course(db, slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ── Lesson publishing ───────────────────────────────────────────
#
# Lessons live in the shop front's course file, not in a table, so the only
# thing stored here is the owner's decision about each one. Absence of a row
# means unpublished: a lesson nobody has checked must not be sellable.

class LessonPublishIn(BaseModel):
    course_slug: str
    lesson_index: int
    published: bool
    note: str = ""


@router.get("/{slug}/lessons/status")
def lesson_status(slug: str, db: Session = Depends(get_db)) -> dict:
    """Which lessons of this course are cleared for sale. Public — the shop
    front needs it to decide whether to offer a lesson at all."""
    rows = (
        db.execute(select(LessonStatus).where(LessonStatus.course_slug == slug))
        .scalars()
        .all()
    )
    return {
        "slug": slug,
        "published": sorted(r.lesson_index for r in rows if r.published),
    }


@router.post("/lessons/publish", dependencies=[Depends(require_admin)])
def set_lesson_published(payload: LessonPublishIn, db: Session = Depends(get_db)) -> dict:
    """Admin: clear a lesson for sale, or pull it back."""
    row = db.execute(
        select(LessonStatus).where(
            LessonStatus.course_slug == payload.course_slug,
            LessonStatus.lesson_index == payload.lesson_index,
        )
    ).scalar_one_or_none()

    if row is None:
        row = LessonStatus(
            course_slug=payload.course_slug, lesson_index=payload.lesson_index
        )
        db.add(row)
    row.published = payload.published
    row.note = payload.note[:300]
    db.commit()
    return {
        "course_slug": row.course_slug,
        "lesson_index": row.lesson_index,
        "published": row.published,
    }


@router.get("/lessons/overview", dependencies=[Depends(require_admin)])
def lessons_overview(db: Session = Depends(get_db)) -> dict:
    """Admin: how many lessons are cleared, per course."""
    rows = db.execute(select(LessonStatus)).scalars().all()
    by_course: dict[str, list[int]] = {}
    for r in rows:
        if r.published:
            by_course.setdefault(r.course_slug, []).append(r.lesson_index)
    return {"published": {k: sorted(v) for k, v in by_course.items()}}
