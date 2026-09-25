"""Keep the API's product table in step with the shop front.

The storefront renders from its own catalogue file; orders are priced and
validated here. When those drift, customers are shown one price and charged
another, or told a product doesn't exist and can't buy it at all — which is
exactly what had happened: 101 of 180 products were unorderable and 34 were
charging pre-increase prices.

Rather than remembering to run a script, the API pulls the shop's public
catalogue feed and upserts from it. Publishing the site is the only step.

What it will not touch: anything on a row that already exists. The feed seeds
products the database has never seen; after that the admin owns them. It used
to overwrite name, price and description from the feed every hour, which meant
a price corrected in the admin was silently reverted — unnoticeable while the
shop front rendered from the same file, and actively destructive once it
renders from the database.
"""

from __future__ import annotations

import logging

import httpx
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.product import Product

logger = logging.getLogger(__name__)

TIMEOUT = 20.0

# Filled in on a row the feed has never seen before. Never used to overwrite:
# once a product exists, the admin is the only thing that changes it.
SEEDED = (
    "name",
    "category",
    "brand",
    "condition",
    "description",
    "price_ugx",
    "old_price_ugx",
    "image_url",
)


async def fetch_catalog() -> list[dict]:
    """Read the shop's catalogue feed. Returns [] if it can't be reached."""
    url = settings.catalog_feed_url
    if not url:
        return []
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            res = await client.get(url)
        if res.status_code >= 400:
            logger.warning("Catalog feed %s returned %s", url, res.status_code)
            return []
        data = res.json()
    except Exception as exc:  # noqa: BLE001 — a bad feed must never break the app
        logger.warning("Catalog feed unreachable: %s", exc)
        return []

    items = data.get("items") if isinstance(data, dict) else data
    if not isinstance(items, list):
        logger.warning("Catalog feed had no item list")
        return []
    return [i for i in items if isinstance(i, dict) and i.get("slug") and i.get("price_ugx")]


def apply_catalog(db: Session, items: list[dict]) -> dict:
    """Create products the database has never seen. Returns a summary for the log.

    Existing rows are left exactly as they are — see the module docstring.
    """
    created = skipped = 0

    for item in items:
        slug = str(item["slug"])
        try:
            row = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Catalog sync lookup failed for %s: %s", slug, exc)
            continue

        values = {
            "name": str(item.get("name") or slug),
            "category": str(item.get("category") or "Accessories"),
            "brand": str(item.get("brand") or ""),
            "condition": str(item.get("condition") or "Brand New"),
            "description": str(item.get("description") or ""),
            "price_ugx": int(item["price_ugx"]),
            "old_price_ugx": int(item["old_price_ugx"]) if item.get("old_price_ugx") else None,
            "image_url": str(item.get("image_url") or ""),
        }

        if row is None:
            db.add(
                Product(
                    slug=slug,
                    rating=float(item.get("rating") or 0),
                    # A new product is sellable; the admin sets counts later.
                    in_stock=bool(item.get("in_stock", True)),
                    stock_qty=0,
                    specs=item.get("specs") or None,
                    **values,
                )
            )
            created += 1
            continue

        # It exists, so it is the admin's now. Only fill a gap the admin has
        # not filled themselves.
        if item.get("specs") and not row.specs:
            row.specs = item["specs"]
        else:
            skipped += 1

    if created:
        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Catalog sync commit failed: %s", exc)
            return {"created": 0, "skipped": skipped, "error": str(exc)[:200]}

    return {"received": len(items), "created": created, "left_alone": skipped}


async def sync(db: Session) -> dict:
    """Fetch and apply in one step. Safe to call on startup and on a timer."""
    if not settings.catalog_sync_enabled:
        return {"skipped": "disabled"}
    items = await fetch_catalog()
    if not items:
        return {"skipped": "no items"}
    result = apply_catalog(db, items)
    if result.get("created"):
        logger.info("Catalog sync: %s", result)
    return result


# ── Courses ─────────────────────────────────────────────────────────────────
# Registration is validated against the courses table. It held four rows while
# the site advertised twenty-two, so registering for any of the other eighteen
# failed with "Unknown course" — invisible, because the form swallowed the
# error and opened WhatsApp instead.


async def fetch_courses() -> list[dict]:
    """Read the site's course feed. Returns [] if it can't be reached."""
    url = settings.course_feed_url
    if not url:
        return []
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            res = await client.get(url)
        if res.status_code >= 400:
            logger.warning("Course feed %s returned %s", url, res.status_code)
            return []
        data = res.json()
    except Exception as exc:  # noqa: BLE001 — a bad feed must never break the app
        logger.warning("Course feed unreachable: %s", exc)
        return []

    items = data.get("items") if isinstance(data, dict) else data
    if not isinstance(items, list):
        logger.warning("Course feed had no item list")
        return []
    return [i for i in items if isinstance(i, dict) and i.get("slug") and i.get("title")]


# What the site advertises and nothing else can change. The admin's course
# screen is read-only, so unlike products there is no edit here to protect —
# a course row that disagrees with the site is simply stale. Four of them
# were: Computer Basics sat at UGX 50,000 while the site advertised 500,000,
# so a learner was emailed a quote for a tenth of the price.
COURSE_FIELDS = ("title", "level", "lessons", "hours", "price_ugx", "blurb", "emoji")


def apply_courses(db: Session, items: list[dict]) -> dict:
    """Create courses the database has never seen, and keep prices honest.

    Lesson plans, materials and quizzes are only filled in when the row has
    none, so anything enriched later is never overwritten.
    """
    from app.models.course import Course

    created = updated = unchanged = 0
    for item in items:
        slug = str(item["slug"])
        try:
            row = db.execute(select(Course).where(Course.slug == slug)).scalar_one_or_none()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Course sync lookup failed for %s: %s", slug, exc)
            continue

        if row is not None:
            changed = False
            for col in COURSE_FIELDS:
                new_value = {
                    "title": str(item.get("title") or slug),
                    "level": str(item.get("level") or "Beginner"),
                    "lessons": int(item.get("lessons") or 0),
                    "hours": int(item.get("hours") or 0),
                    "price_ugx": int(item.get("price_ugx") or 0),
                    "blurb": str(item.get("blurb") or ""),
                    "emoji": str(item.get("emoji") or "learn"),
                }[col]
                current = getattr(row, col)
                if col == "price_ugx" and current is not None:
                    current = int(current)
                if current != new_value:
                    setattr(row, col, new_value)
                    changed = True
            # Only ever fill a gap here, never replace real teaching content.
            for col in ("syllabus", "materials", "quiz"):
                if item.get(col) and not getattr(row, col):
                    setattr(row, col, item[col])
                    changed = True
            if changed:
                updated += 1
            else:
                unchanged += 1
            continue

        db.add(
            Course(
                slug=slug,
                title=str(item.get("title") or slug),
                level=str(item.get("level") or "Beginner"),
                lessons=int(item.get("lessons") or 0),
                hours=int(item.get("hours") or 0),
                price_ugx=int(item.get("price_ugx") or 0),
                blurb=str(item.get("blurb") or ""),
                emoji=str(item.get("emoji") or "learn"),
                syllabus=item.get("syllabus") or None,
                materials=item.get("materials") or None,
                quiz=item.get("quiz") or None,
            )
        )
        created += 1

    if created or updated:
        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Course sync commit failed: %s", exc)
            return {"created": 0, "updated": 0, "error": str(exc)[:200]}

    return {
        "received": len(items),
        "created": created,
        "updated": updated,
        "unchanged": unchanged,
    }


async def sync_courses(db: Session) -> dict:
    """Fetch and apply the course feed. Safe on startup and on a timer."""
    if not settings.catalog_sync_enabled:
        return {"skipped": "disabled"}
    items = await fetch_courses()
    if not items:
        return {"skipped": "no items"}
    result = apply_courses(db, items)
    if result.get("created") or result.get("updated"):
        logger.info("Course sync: %s", result)
    return result
