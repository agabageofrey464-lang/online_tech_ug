import json
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.course import CourseOut
from app.services import courses, unlock_codes

router = APIRouter()

# Written course notes live on the SERVER (not in the browser bundle), so the
# full content is only ever sent to a paid learner or the owner.
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
    db_ok = bool(entered) and not static_ok and unlock_codes.verify_code(db, slug, code)

    if is_owner or static_ok or db_ok:
        return {"unlocked": True, "units": units}
    return {"unlocked": False, "units": preview}


@router.get("/{slug}", response_model=CourseOut)
def get_course(slug: str, db: Session = Depends(get_db)) -> dict:
    course = courses.get_course(db, slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
