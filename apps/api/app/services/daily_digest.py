"""The daily "what's new" email to subscribers and account holders.

An automatic daily send used to exist here and was switched off, with the
reason written into the worker: it was too much mail. It sent the same shape
of message every day whether or not anything had happened — a campaign title
under "here is what's new in the shop today" — which teaches people to ignore
it and then to unsubscribe.

This one only goes out when there is something to say. It reads what has
appeared since the last digest — new stock, new courses, new writing — and if
that comes to nothing, it sends nothing and tries again tomorrow. A quiet week
produces silence rather than four identical emails.

Everything is sent through newsletter.broadcast, so the unsubscribe footer,
the branding and the recipient list (subscribers plus account holders, de-
duplicated) are the same as every other message we send.
"""

from __future__ import annotations

import logging
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.course import Course
from app.models.digest import DailyDigest
from app.models.post import Post
from app.models.product import Product
from app.services import newsletter

logger = logging.getLogger(__name__)

SITE = settings.site_url.rstrip("/")
MAX_PER_SECTION = 6


def _ugx(n) -> str:
    return f"UGX {int(n):,}"


def _last(db: Session) -> DailyDigest | None:
    return db.execute(
        select(DailyDigest).order_by(DailyDigest.sent_on.desc()).limit(1)
    ).scalar_one_or_none()


def _new_products(db: Session, after_id: int) -> list[Product]:
    return list(
        db.execute(
            select(Product)
            .where(Product.id > after_id, Product.in_stock.is_(True))
            .order_by(Product.id.desc())
            .limit(MAX_PER_SECTION)
        )
        .scalars()
        .all()
    )


def _new_courses(db: Session, after_id: int) -> list[Course]:
    return list(
        db.execute(
            select(Course).where(Course.id > after_id).order_by(Course.id.desc()).limit(MAX_PER_SECTION)
        )
        .scalars()
        .all()
    )


def _new_posts(db: Session, after_id: int) -> list[Post]:
    return list(
        db.execute(
            select(Post)
            .where(Post.id > after_id, Post.published.is_(True))
            .order_by(Post.id.desc())
            .limit(MAX_PER_SECTION)
        )
        .scalars()
        .all()
    )


def _max_id(db: Session, model) -> int:
    row = db.execute(select(model.id).order_by(model.id.desc()).limit(1)).scalar_one_or_none()
    return int(row or 0)


def _card(title: str, sub: str, href: str, price: str = "") -> str:
    price_html = (
        f'<span style="display:block;font-weight:700;color:#d9430f;font-size:15px">{price}</span>'
        if price
        else ""
    )
    return (
        '<tr><td style="padding:10px 0;border-bottom:1px solid #eeeef4">'
        f'<a href="{href}" style="text-decoration:none;color:#12102e">'
        f'<span style="display:block;font-weight:700;font-size:15px">{title}</span>'
        f'<span style="display:block;color:#6b6b80;font-size:13px;margin-top:2px">{sub}</span>'
        f"{price_html}</a></td></tr>"
    )


def _section(heading: str, rows: list[str]) -> str:
    if not rows:
        return ""
    return (
        f'<h2 style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#12102e;'
        f'margin:22px 0 4px">{heading}</h2>'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="font-family:Arial,Helvetica,sans-serif">' + "".join(rows) + "</table>"
    )


def compose(db: Session) -> tuple[str, str, dict] | None:
    """Build today's digest, or None when there is nothing worth sending."""
    last = _last(db)
    after_p = last.last_product_id if last else _max_id(db, Product)
    after_c = last.last_course_id if last else _max_id(db, Course)
    after_n = last.last_post_id if last else _max_id(db, Post)

    # On the very first run there is no "since", so nothing is new and nothing
    # is sent — the marker is laid down and tomorrow's digest is the real one.
    # Mailing the whole catalogue to everybody as "new today" would be a lie.
    products = _new_products(db, after_p)
    courses = _new_courses(db, after_c)
    posts = _new_posts(db, after_n)

    if not (products or courses or posts):
        return None

    parts = [
        _section(
            "New in the shop",
            [
                _card(
                    p.name,
                    f"{p.condition} · {p.category}",
                    f"{SITE}/shop/{p.slug}",
                    _ugx(p.price_ugx),
                )
                for p in products
            ],
        ),
        _section(
            "New courses",
            [
                _card(
                    c.title,
                    f"{c.level} · {c.lessons} lessons",
                    f"{SITE}/learn/{c.slug}",
                    _ugx(c.price_ugx) if c.price_ugx else "",
                )
                for c in courses
            ],
        ),
        _section(
            "From the blog",
            [_card(n.title, n.excerpt or n.category, f"{SITE}/blog/{n.slug}") for n in posts],
        ),
    ]

    counts = []
    if products:
        counts.append(f"{len(products)} new item{'s' if len(products) > 1 else ''} in the shop")
    if courses:
        counts.append(f"{len(courses)} new course{'s' if len(courses) > 1 else ''}")
    if posts:
        counts.append(f"{len(posts)} new post{'s' if len(posts) > 1 else ''}")

    subject = "Online Tech Uganda — " + ", ".join(counts)
    intro = (
        '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2b2b3a">'
        "Here is what has arrived since we last wrote.</p>"
    )
    body = intro + "".join(parts)

    marks = {
        "last_product_id": max([p.id for p in products], default=after_p),
        "last_course_id": max([c.id for c in courses], default=after_c),
        "last_post_id": max([n.id for n in posts], default=after_n),
    }
    return subject, body, marks


async def run(db: Session, today: date | None = None) -> dict:
    """Send today's digest if it is due and there is news. Safe to call hourly."""
    if not settings.daily_digest_enabled:
        return {"sent": False, "reason": "disabled"}

    today = today or datetime.utcnow().date()

    already = db.execute(
        select(DailyDigest).where(DailyDigest.sent_on == today)
    ).scalar_one_or_none()
    if already is not None:
        return {"sent": False, "reason": "already sent today"}

    last = _last(db)
    composed = compose(db)

    if composed is None:
        # Nothing new. On the first ever run, lay down the marker so tomorrow
        # knows where to start; otherwise stay quiet and leave the marker
        # alone, so the next real digest still covers everything since.
        if last is None:
            db.add(
                DailyDigest(
                    sent_on=today,
                    subject="(first run — marker only)",
                    recipients=0,
                    last_product_id=_max_id(db, Product),
                    last_course_id=_max_id(db, Course),
                    last_post_id=_max_id(db, Post),
                )
            )
            db.commit()
            return {"sent": False, "reason": "first run, marker set"}
        return {"sent": False, "reason": "nothing new"}

    subject, body, marks = composed
    result = await newsletter.broadcast(db, subject, body, include_customers=True)
    recipients = int(result.get("sent", 0)) if isinstance(result, dict) else 0

    db.add(DailyDigest(sent_on=today, subject=subject, recipients=recipients, **marks))
    db.commit()
    logger.info("Daily digest sent to %s recipients: %s", recipients, subject)
    return {"sent": True, "recipients": recipients, "subject": subject}
