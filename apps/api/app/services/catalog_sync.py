"""Keep the API's product table in step with the shop front.

The storefront renders from its own catalogue file; orders are priced and
validated here. When those drift, customers are shown one price and charged
another, or told a product doesn't exist and can't buy it at all — which is
exactly what had happened: 101 of 180 products were unorderable and 34 were
charging pre-increase prices.

Rather than remembering to run a script, the API pulls the shop's public
catalogue feed and upserts from it. Publishing the site is the only step.

What it will not touch: stock_qty and in_stock, which the owner manages in the
admin and the shop front knows nothing about. Structured specs are filled in
only when the row has none, so hand-written detail is never overwritten.
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

# Columns the shop front owns. Anything not listed here is left as the admin set it.
SYNCED = (
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
    """Upsert `items`. Returns a small summary for the log."""
    created = updated = 0

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

        changed = False
        for col in SYNCED:
            new = values[col]
            old = getattr(row, col)
            if col.endswith("_ugx") and old is not None:
                old = int(old)
            if old != new:
                setattr(row, col, new)
                changed = True
        if item.get("specs") and not row.specs:
            row.specs = item["specs"]
            changed = True
        if changed:
            updated += 1

    if created or updated:
        try:
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Catalog sync commit failed: %s", exc)
            return {"created": 0, "updated": 0, "error": str(exc)[:200]}

    return {"received": len(items), "created": created, "updated": updated}


async def sync(db: Session) -> dict:
    """Fetch and apply in one step. Safe to call on startup and on a timer."""
    if not settings.catalog_sync_enabled:
        return {"skipped": "disabled"}
    items = await fetch_catalog()
    if not items:
        return {"skipped": "no items"}
    result = apply_catalog(db, items)
    if result.get("created") or result.get("updated"):
        logger.info("Catalog sync: %s", result)
    return result
