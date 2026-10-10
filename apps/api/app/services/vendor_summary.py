"""One message a day about what vendors listed, instead of one per product.

A vendor stocking their shop adds products one after another, and each used to
send the owner an email, a WhatsApp and a push notification — a dozen alerts in
ten minutes for what is a single piece of news. Listings still go live at once;
the owner now hears about them together, once in the evening: who listed, how
many, and what.

The time of the last summary is kept in a small file beside the uploads, so a
restart neither repeats a summary nor skips a day. A day on which nobody
listed anything sends nothing.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.vendor_product import VendorProduct
from app.services import notify

logger = logging.getLogger(__name__)

# 18:00 in Kampala (UTC+3): after the trading day, before the evening.
SUMMARY_HOUR_UTC = 15
MARKER = ".vendor-summary-last"


def _marker() -> Path:
    return Path(settings.upload_dir) / MARKER


def _last_sent(now: datetime) -> datetime:
    try:
        return datetime.fromisoformat(_marker().read_text(encoding="utf-8").strip())
    except (OSError, ValueError):
        # Never sent: look back one day, not over everything ever listed.
        return now - timedelta(days=1)


def due(now: datetime | None = None) -> bool:
    """True once the evening hour has come and today's summary has not gone."""
    now = now or datetime.utcnow()
    if now.hour < SUMMARY_HOUR_UTC:
        return False
    return _last_sent(now).date() < now.date() or not _marker().exists()


async def run(db: Session, now: datetime | None = None) -> dict:
    """Send the day's summary if there is anything in it. Marks the day either way."""
    now = now or datetime.utcnow()
    since = _last_sent(now)
    rows = db.execute(
        select(VendorProduct).where(VendorProduct.created_at > since).order_by(VendorProduct.vendor_id, VendorProduct.id)
    ).scalars().all()

    by_vendor: dict[int, list[VendorProduct]] = {}
    for r in rows:
        by_vendor.setdefault(r.vendor_id, []).append(r)

    if by_vendor:
        pairs: list[tuple[str, str]] = []
        for vendor_id, items in by_vendor.items():
            vendor = db.get(User, vendor_id)
            name = (vendor.business_name or vendor.name) if vendor else f"Vendor {vendor_id}"
            shown = ", ".join(f"{i.name.strip()} (UGX {int(i.price_ugx):,})" for i in items[:6])
            more = f" and {len(items) - 6} more" if len(items) > 6 else ""
            pairs.append((f"{name} — {len(items)} new", shown + more))
        total = len(rows)
        await notify.alert_owner(
            icon="🏪",
            title=f"{total} new vendor product{'s' if total != 1 else ''} today",
            pairs=pairs,
            note="These went live as they were listed.",
            where="Admin › Vendors to review or unapprove any of them",
            db=db,
            url="/vendors",
        )

    try:
        _marker().parent.mkdir(parents=True, exist_ok=True)
        _marker().write_text(now.isoformat(), encoding="utf-8")
    except OSError as exc:
        logger.warning("Could not record the vendor summary time: %s", exc)
    return {"sent": bool(by_vendor), "products": len(rows), "vendors": len(by_vendor)}
