"""Student discussion community — questions and answers per course.

Public so learners can help each other, but every post is moderatable and
rate-limited, because an open text box on a public site attracts spam.
"""

import logging
import re
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.discussion import DiscussionPost

logger = logging.getLogger("onlinetech.discussion")

MAX_BODY = 4000
MAX_TITLE = 200
# A student cannot post more than this many times in the window — enough for a
# real conversation, not enough to flood the board.
RATE_LIMIT = 6
RATE_WINDOW_MINUTES = 10

_LINK = re.compile(r"https?://", re.I)


def _clean(text: str, limit: int) -> str:
    return " ".join((text or "").split())[:limit]


def _to_dict(p: DiscussionPost, replies: int = 0) -> dict:
    return {
        "id": p.id,
        "course_slug": p.course_slug,
        "parent_id": p.parent_id,
        "author_name": p.author_name or "Student",
        "title": p.title,
        "body": p.body,
        "is_staff": p.is_staff,
        "likes": p.likes,
        "replies": replies,
        "created_at": p.created_at,
    }


def _rate_limited(db: Session, device_token: str) -> bool:
    if not device_token:
        return False
    since = datetime.utcnow() - timedelta(minutes=RATE_WINDOW_MINUTES)
    n = db.execute(
        select(func.count())
        .select_from(DiscussionPost)
        .where(DiscussionPost.device_token == device_token, DiscussionPost.created_at >= since)
    ).scalar_one()
    return n >= RATE_LIMIT


def create_post(
    db: Session,
    *,
    course_slug: str,
    title: str,
    body: str,
    author_name: str,
    author_email: str = "",
    parent_id: int | None = None,
    device_token: str = "",
    is_staff: bool = False,
) -> dict:
    body = _clean(body, MAX_BODY)
    if len(body) < 3:
        raise ValueError("Please write your question first.")
    if _rate_limited(db, device_token):
        raise ValueError("You're posting very quickly — please wait a few minutes.")

    # A brand new post that is mostly a link is almost always spam.
    if not is_staff and _LINK.search(body) and len(body) < 60:
        raise ValueError("Posts that are only a link aren't allowed.")

    if parent_id is not None:
        parent = db.get(DiscussionPost, parent_id)
        if not parent or parent.hidden:
            raise ValueError("That discussion no longer exists.")
        course_slug = parent.course_slug

    row = DiscussionPost(
        course_slug=course_slug or "general",
        parent_id=parent_id,
        title=_clean(title, MAX_TITLE) if parent_id is None else "",
        body=body,
        author_name=_clean(author_name, 120) or "Student",
        author_email=_clean(author_email, 200),
        device_token=device_token,
        is_staff=is_staff,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_dict(row)


def list_threads(db: Session, course_slug: str | None = None, limit: int = 50) -> list[dict]:
    """Top-level posts, newest first, each with its reply count."""
    stmt = (
        select(DiscussionPost)
        .where(DiscussionPost.parent_id.is_(None), DiscussionPost.hidden.is_(False))
        .order_by(DiscussionPost.created_at.desc())
        .limit(limit)
    )
    if course_slug and course_slug != "all":
        stmt = stmt.where(DiscussionPost.course_slug == course_slug)
    rows = db.execute(stmt).scalars().all()

    out = []
    for r in rows:
        n = db.execute(
            select(func.count())
            .select_from(DiscussionPost)
            .where(DiscussionPost.parent_id == r.id, DiscussionPost.hidden.is_(False))
        ).scalar_one()
        out.append(_to_dict(r, n))
    return out


def rooms(db: Session) -> list[dict]:
    """Every course discussion that has something in it, busiest first.

    A dropdown hides where the conversation is. A student wants to see which
    rooms are alive before deciding where to ask, so each one carries its
    message count and when it was last used.
    """
    rows = db.execute(
        select(
            DiscussionPost.course_slug,
            func.count(DiscussionPost.id),
            func.max(DiscussionPost.created_at),
        )
        .where(DiscussionPost.hidden.is_(False))
        .group_by(DiscussionPost.course_slug)
    ).all()

    out = [
        {
            "course_slug": slug or "general",
            "messages": int(count or 0),
            "last_activity": last.isoformat() if last else None,
        }
        for slug, count, last in rows
    ]
    out.sort(key=lambda r: (r["last_activity"] or ""), reverse=True)
    return out


def get_thread(db: Session, post_id: int) -> dict | None:
    root = db.get(DiscussionPost, post_id)
    if not root or root.hidden or root.parent_id is not None:
        return None
    replies = db.execute(
        select(DiscussionPost)
        .where(DiscussionPost.parent_id == post_id, DiscussionPost.hidden.is_(False))
        .order_by(DiscussionPost.created_at.asc())
    ).scalars().all()
    return {"post": _to_dict(root, len(replies)), "replies": [_to_dict(r) for r in replies]}


def like_post(db: Session, post_id: int) -> dict | None:
    row = db.get(DiscussionPost, post_id)
    if not row or row.hidden:
        return None
    row.likes += 1
    db.commit()
    return {"id": row.id, "likes": row.likes}


def delete_own(db: Session, post_id: int, device_token: str) -> bool:
    """A student removing their own post — only from the device that wrote it."""
    row = db.get(DiscussionPost, post_id)
    if not row or not device_token or row.device_token != device_token:
        return False
    row.hidden = True
    db.commit()
    return True


# ── Admin moderation ────────────────────────────────────────────────────
def admin_list(db: Session, include_hidden: bool = True, limit: int = 200) -> list[dict]:
    stmt = select(DiscussionPost).order_by(DiscussionPost.created_at.desc()).limit(limit)
    if not include_hidden:
        stmt = stmt.where(DiscussionPost.hidden.is_(False))
    rows = db.execute(stmt).scalars().all()
    return [{**_to_dict(r), "hidden": r.hidden, "author_email": r.author_email} for r in rows]


def set_hidden(db: Session, post_id: int, hidden: bool) -> dict | None:
    row = db.get(DiscussionPost, post_id)
    if not row:
        return None
    row.hidden = hidden
    db.commit()
    return {"id": row.id, "hidden": row.hidden}


def stats(db: Session) -> dict:
    total = db.execute(select(func.count()).select_from(DiscussionPost)).scalar_one()
    hidden = db.execute(
        select(func.count()).select_from(DiscussionPost).where(DiscussionPost.hidden.is_(True))
    ).scalar_one()
    unanswered = db.execute(
        select(func.count())
        .select_from(DiscussionPost)
        .where(DiscussionPost.parent_id.is_(None), DiscussionPost.hidden.is_(False))
    ).scalar_one()
    return {"total": total, "hidden": hidden, "threads": unanswered}
