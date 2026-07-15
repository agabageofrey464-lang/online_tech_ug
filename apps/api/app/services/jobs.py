"""Job / internship postings — DB-backed with a seed fallback.

Keep the seed in sync with the storefront's original static list so the page is
never empty before the admin adds their own postings.
"""

import logging

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.job import Job

logger = logging.getLogger("onlinetech.jobs")


SEED_JOBS: list[dict] = [
    {
        "title": "Software Developer",
        "type": "Full-time",
        "category": "Software",
        "location": "Kampala (Hybrid)",
        "summary": "Build websites, web apps and systems for our clients using modern tools.",
        "requirements": [
            "Experience with JavaScript/TypeScript (React/Next.js a plus)",
            "Understanding of APIs and databases",
            "A portfolio or GitHub to show your work",
        ],
        "openings": 2,
    },
    {
        "title": "IT Support Technician",
        "type": "Full-time",
        "category": "IT Support",
        "location": "Kampala",
        "summary": "Diagnose and repair laptops/desktops, install software, and support clients onsite & remotely.",
        "requirements": [
            "Hardware & software troubleshooting skills",
            "Knowledge of Windows installation & networking basics",
            "Good communication and customer care",
        ],
        "openings": 1,
    },
    {
        "title": "Web Development Intern",
        "type": "Internship",
        "category": "Software",
        "location": "Kampala",
        "summary": "Learn on the job building real websites alongside our developers.",
        "requirements": ["Basic HTML/CSS/JavaScript", "Eager to learn and grow", "Student or recent graduate welcome"],
        "openings": 3,
    },
    {
        "title": "Computer Sales & Customer Care",
        "type": "Full-time",
        "category": "Sales",
        "location": "Kampala",
        "summary": "Help customers choose the right devices, in-store and on WhatsApp.",
        "requirements": [
            "Good knowledge of computers & accessories",
            "Friendly, persuasive communication",
            "Basic record-keeping",
        ],
        "openings": 2,
    },
    {
        "title": "Digital Marketing Intern",
        "type": "Internship",
        "category": "Marketing",
        "location": "Remote / Kampala",
        "summary": "Create content for social media (TikTok, Instagram) and grow our online presence.",
        "requirements": ["Social media savvy", "Basic content creation/editing", "Creative and consistent"],
        "openings": 2,
    },
]


def _to_dict(j: Job) -> dict:
    return {
        "id": j.id,
        "title": j.title,
        "type": j.type,
        "category": j.category,
        "location": j.location,
        "summary": j.summary,
        "requirements": j.requirements or [],
        "openings": j.openings,
        "is_open": j.is_open,
        "created_at": j.created_at,
    }


def list_jobs(db: Session, include_closed: bool = False) -> list[dict]:
    try:
        stmt = select(Job).order_by(Job.created_at.desc())
        if not include_closed:
            stmt = stmt.where(Job.is_open.is_(True))
        rows = db.execute(stmt).scalars().all()
        if rows:
            return [_to_dict(r) for r in rows]
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Jobs DB query failed, using seed: %s", exc)
    return [{"id": i + 1, "is_open": True, "created_at": None, **j} for i, j in enumerate(SEED_JOBS)]


def get_job(db: Session, job_id: int) -> Job | None:
    return db.get(Job, job_id)


def create_job(db: Session, data: dict) -> Job:
    row = Job(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_job(db: Session, job_id: int, data: dict) -> Job | None:
    row = db.get(Job, job_id)
    if not row:
        return None
    for key, value in data.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_job(db: Session, job_id: int) -> bool:
    row = db.get(Job, job_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def seed_jobs(db: Session) -> int:
    """Insert seed jobs if the table is empty. Returns count inserted."""
    existing = db.execute(select(Job.id)).first()
    if existing:
        return 0
    added = 0
    for j in SEED_JOBS:
        db.add(Job(**j))
        added += 1
    if added:
        db.commit()
    return added
