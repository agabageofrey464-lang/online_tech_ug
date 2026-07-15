"""Blog / technology-news posts — DB-backed with a tech-news seed."""

import logging
import re
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.post import Post

logger = logging.getLogger("onlinetech.posts")


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:180] or "post"


SEED_POSTS: list[dict] = [
    {
        "title": "AI Laptops Are Here: What the New NPU Chips Mean for You",
        "type": "news",
        "category": "Technology",
        "excerpt": "Copilot+ PCs and on-device AI are changing what a laptop can do. Here's what matters for Ugandan buyers.",
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200",
        "body": (
            "The latest laptops ship with a dedicated NPU (Neural Processing Unit) that runs AI tasks on the "
            "device itself — faster, more private, and without needing constant internet.\n\n"
            "For everyday users this means quicker photo editing, live translation, background noise removal on "
            "calls, and smarter battery life. For students and businesses, on-device AI keeps your data local.\n\n"
            "Our advice: if you're buying new in 2026, an NPU-equipped laptop is a smart future-proof choice, but a "
            "solid traditional laptop still handles Office, browsing and design perfectly for less money."
        ),
    },
    {
        "title": "Mobile Money Security: 6 Habits That Protect Your Cash",
        "type": "blog",
        "category": "Security",
        "excerpt": "Simple, practical steps to keep your MTN and Airtel Money safe from fraud and SIM-swap scams.",
        "image_url": "",
        "body": (
            "Mobile Money is convenient — and a target for fraudsters. Protect yourself with a few habits.\n\n"
            "Never share your PIN, not even with 'customer care'. Real agents never ask for it. Confirm the "
            "recipient number before sending. Ignore 'you have won' messages and links.\n\n"
            "Lock your SIM with a PIN to block SIM-swap attacks, keep your phone updated, and report anything "
            "suspicious to your provider immediately. A few seconds of caution saves your savings."
        ),
    },
    {
        "title": "Starlink & Faster Internet in Uganda: Is It Worth It?",
        "type": "news",
        "category": "Uganda",
        "excerpt": "Satellite internet is expanding across the region. We break down the costs, speeds and who should switch.",
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
        "body": (
            "Satellite internet promises fast speeds even outside town, where fibre doesn't reach. For rural "
            "businesses, schools and remote workers, that's a genuine game-changer.\n\n"
            "The trade-offs are upfront hardware cost and monthly fees that are higher than typical mobile data. "
            "In town, a good fibre or 4G/5G package is usually cheaper and fast enough.\n\n"
            "Bottom line: if you're far from reliable coverage and need dependable speed, it's worth costing out. "
            "In the city, stick with fibre or a strong mobile plan."
        ),
    },
]


def _to_dict(p: Post) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "title": p.title,
        "type": getattr(p, "type", "blog") or "blog",
        "category": p.category,
        "excerpt": p.excerpt,
        "body": p.body,
        "image_url": p.image_url,
        "author": p.author,
        "published": p.published,
        "created_at": p.created_at,
    }


def list_posts(db: Session, include_unpublished: bool = False, post_type: str | None = None) -> list[dict]:
    try:
        stmt = select(Post).order_by(Post.created_at.desc())
        if not include_unpublished:
            stmt = stmt.where(Post.published.is_(True))
        if post_type:
            stmt = stmt.where(Post.type == post_type)
        rows = db.execute(stmt).scalars().all()
        return [_to_dict(r) for r in rows]
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Posts query failed: %s", exc)
        return []


def get_post(db: Session, slug: str) -> dict | None:
    row = db.execute(select(Post).where(Post.slug == slug)).scalar_one_or_none()
    return _to_dict(row) if row else None


def create(db: Session, data: dict) -> Post:
    data = dict(data)
    base = slugify(data.get("slug") or data["title"])
    slug, n = base, 2
    while db.execute(select(Post).where(Post.slug == slug)).scalar_one_or_none():
        slug = f"{base}-{n}"
        n += 1
    data["slug"] = slug
    row = Post(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update(db: Session, post_id: int, data: dict) -> Post | None:
    row = db.get(Post, post_id)
    if not row:
        return None
    for k, v in data.items():
        if k == "slug":
            continue  # slug is immutable once created
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


def delete(db: Session, post_id: int) -> bool:
    row = db.get(Post, post_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def seed_posts(db: Session) -> int:
    if db.execute(select(Post.id)).first():
        return 0
    added = 0
    for p in SEED_POSTS:
        db.add(Post(slug=slugify(p["title"]), created_at=datetime.utcnow(), **p))
        added += 1
    if added:
        db.commit()
    return added
