"""Careers: job applications (with CV upload) and the freelancers directory."""

import os
import re
import secrets
from pathlib import Path

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.application import Application
from app.models.freelancer import Freelancer
from app.models.freelancer_contact import FreelancerContact

ALLOWED_CV_EXT = {".pdf", ".doc", ".docx"}
MAX_CV_BYTES = 5 * 1024 * 1024  # 5 MB


def _cv_dir() -> Path:
    d = Path(settings.upload_dir) / "cv"
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_cv(filename: str, content: bytes) -> str:
    """Save an uploaded CV, returning the stored filename. Raises ValueError on bad file."""
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_CV_EXT:
        raise ValueError("CV must be a PDF, DOC or DOCX file")
    if len(content) > MAX_CV_BYTES:
        raise ValueError("CV must be under 5 MB")
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename or "cv"))[:60]
    stored = f"{secrets.token_hex(6)}_{safe}"
    (_cv_dir() / stored).write_bytes(content)
    return stored


def cv_path(stored: str) -> Path | None:
    p = _cv_dir() / stored
    return p if p.exists() else None


# --- Applications ---
def create_application(db: Session, data: dict) -> Application:
    row = Application(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_applications(db: Session) -> list[dict]:
    rows = db.execute(select(Application).order_by(Application.created_at.desc())).scalars().all()
    return [
        {
            "id": a.id, "job_id": a.job_id, "job_title": a.job_title, "name": a.name,
            "email": a.email, "phone": a.phone, "message": a.message,
            "has_cv": bool(a.cv_filename), "status": a.status, "created_at": a.created_at,
        }
        for a in rows
    ]


def get_application(db: Session, application_id: int) -> Application | None:
    return db.get(Application, application_id)


def set_application_status(db: Session, application_id: int, status: str) -> bool:
    row = db.get(Application, application_id)
    if not row:
        return False
    row.status = status
    db.commit()
    return True


# --- Freelancers ---
def _fdict(f: Freelancer) -> dict:
    return {
        "id": f.id, "name": f.name, "title": f.title,
        "skills": [s.strip() for s in f.skills.split(",") if s.strip()],
        "bio": f.bio, "rate": f.rate, "location": f.location,
        "phone": f.phone, "email": f.email, "portfolio_url": f.portfolio_url,
        "image_url": f.image_url, "approved": f.approved, "created_at": f.created_at,
        "subscription_ends": f.subscription_ends.isoformat() if f.subscription_ends else None,
    }


def list_freelancers(db: Session, include_unapproved: bool = False) -> list[dict]:
    stmt = select(Freelancer).order_by(Freelancer.created_at.desc())
    if not include_unapproved:
        stmt = stmt.where(Freelancer.approved.is_(True))
    return [_fdict(f) for f in db.execute(stmt).scalars().all()]


def create_freelancer(db: Session, data: dict, approved: bool = False) -> Freelancer:
    row = Freelancer(approved=approved, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


CONTACT_CHANNELS = ("whatsapp", "phone", "email", "portfolio")


def record_contact(db: Session, freelancer_id: int, channel: str) -> Freelancer | None:
    """Log that a visitor was handed off to this freelancer. Returns the row, or None.

    Only listed (approved) freelancers count — an unapproved profile is not
    reachable from the directory, so a contact on one would be a bad request,
    not a lead.
    """
    if channel not in CONTACT_CHANNELS:
        return None
    row = db.get(Freelancer, freelancer_id)
    if not row or not row.approved:
        return None
    db.add(FreelancerContact(freelancer_id=freelancer_id, channel=channel))
    db.commit()
    return row


def contact_counts(db: Session) -> dict[int, int]:
    """How many times each freelancer has been contacted, for the admin list."""
    rows = db.execute(
        select(FreelancerContact.freelancer_id, func.count(FreelancerContact.id)).group_by(
            FreelancerContact.freelancer_id
        )
    ).all()
    return {fid: n for fid, n in rows}


def update_freelancer(db: Session, freelancer_id: int, changes: dict) -> Freelancer | None:
    """Apply the given fields to one freelancer. Returns None if there is no such row.

    Only keys actually present are written, so a caller correcting a dead photo
    URL cannot accidentally blank out somebody's bio by omitting it.
    """
    row = db.get(Freelancer, freelancer_id)
    if not row:
        return None
    for field, value in changes.items():
        if value is not None and hasattr(row, field):
            setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


def set_freelancer_approved(db: Session, freelancer_id: int, approved: bool) -> bool:
    row = db.get(Freelancer, freelancer_id)
    if not row:
        return False
    row.approved = approved
    db.commit()
    return True


def delete_freelancer(db: Session, freelancer_id: int) -> bool:
    row = db.get(Freelancer, freelancer_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True
