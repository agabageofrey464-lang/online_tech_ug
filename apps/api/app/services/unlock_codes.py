"""Per-payment course unlock codes.

The admin generates a unique code for a course after a learner pays; the learner
enters it to unlock the course. Codes are verified server-side.
"""

import logging
import secrets
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.unlock_code import UnlockCode
from app.services.courses import get_course

logger = logging.getLogger("onlinetech.unlock_codes")

# Short course prefixes for readable codes (fallback = first letters of the slug).
_PREFIX = {
    "computer-basics": "CB",
    "microsoft-office": "OF",
    "internet-email": "NE",
    "typing-skills": "TY",
}


def _prefix(slug: str) -> str:
    return _PREFIX.get(slug) or "".join(w[0] for w in slug.split("-"))[:2].upper() or "OT"


def _to_dict(c: UnlockCode) -> dict:
    return {
        "id": c.id,
        "code": c.code,
        "course_slug": c.course_slug,
        "note": c.note,
        "redeemed_count": c.redeemed_count,
        "revoked": c.revoked,
        "created_at": c.created_at,
        "last_used": c.last_used,
    }


def generate_code(db: Session, course_slug: str, note: str = "", pending: bool = False) -> dict:
    """Create a unique unlock code for a course. Raises ValueError if course unknown.

    `pending=True` creates the code in a not-yet-active state (revoked) — used for
    self-service learner registration, where the code only works once payment is
    confirmed and an admin activates it. Admin-generated codes are active immediately.
    """
    if not get_course(db, course_slug):
        raise ValueError("Unknown course")
    # Retry until we get a code that doesn't collide.
    for _ in range(10):
        code = f"{_prefix(course_slug)}-{secrets.token_hex(3).upper()}"  # e.g. CB-9F2A1C
        exists = db.execute(select(UnlockCode).where(UnlockCode.code == code)).scalar_one_or_none()
        if not exists:
            row = UnlockCode(code=code, course_slug=course_slug, note=note, revoked=pending)
            db.add(row)
            db.commit()
            db.refresh(row)
            return _to_dict(row)
    raise ValueError("Could not generate a unique code, try again")


def verify_code(db: Session, course_slug: str, code: str) -> bool:
    """True if the code is valid for the course (exists, matches, not revoked)."""
    entered = code.strip().upper()
    try:
        row = db.execute(
            select(UnlockCode).where(UnlockCode.code == entered)
        ).scalar_one_or_none()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Unlock verify failed: %s", exc)
        return False
    if not row or row.revoked or row.course_slug != course_slug:
        return False
    row.redeemed_count += 1
    row.last_used = datetime.utcnow()
    db.commit()
    return True


def list_codes(db: Session, course_slug: str | None = None) -> list[dict]:
    stmt = select(UnlockCode).order_by(UnlockCode.created_at.desc())
    if course_slug:
        stmt = stmt.where(UnlockCode.course_slug == course_slug)
    rows = db.execute(stmt).scalars().all()
    return [_to_dict(r) for r in rows]


def set_revoked(db: Session, code_id: int, revoked: bool) -> dict | None:
    """Revoke (or un-revoke) a code. Returns the updated code, or None if not found."""
    row = db.get(UnlockCode, code_id)
    if not row:
        return None
    row.revoked = revoked
    db.commit()
    db.refresh(row)
    return _to_dict(row)
