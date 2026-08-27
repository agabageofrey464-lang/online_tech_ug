"""Own-brand promotional campaigns: create, schedule, and serve the live ones."""

import logging
import re
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign

logger = logging.getLogger("onlinetech.campaigns")


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or "campaign"


def _to_dict(c: Campaign) -> dict:
    return {
        "id": c.id,
        "slug": c.slug,
        "program": c.program,
        "badge": c.badge,
        "badge_sub": c.badge_sub,
        "title": c.title,
        "pill": c.pill,
        "note": c.note,
        "small": c.small,
        "cta_label": c.cta_label,
        "link_url": c.link_url,
        "image_url": c.image_url,
        "bg_color": c.bg_color,
        "panel_color": c.panel_color,
        "starts_at": c.starts_at,
        "ends_at": c.ends_at,
        "active": c.active,
        "priority": c.priority,
        "placement": c.placement,
        "discount_pct": c.discount_pct,
        "clicks": c.clicks,
        "live": is_live(c),
    }


def is_live(c: Campaign, now: datetime | None = None) -> bool:
    now = now or datetime.utcnow()
    if not c.active:
        return False
    if c.starts_at and now < c.starts_at:
        return False
    if c.ends_at and now > c.ends_at:
        return False
    return True


def live_campaigns(db: Session, placement: str | None = None) -> list[dict]:
    """What the storefront should show right now — scheduled, in order."""
    stmt = select(Campaign).where(Campaign.active.is_(True))
    if placement:
        stmt = stmt.where(Campaign.placement.in_([placement, "both"]))
    rows = db.execute(stmt).scalars().all()
    now = datetime.utcnow()
    live = [c for c in rows if is_live(c, now)]
    live.sort(key=lambda c: (-c.priority, c.id))
    return [_to_dict(c) for c in live]


def list_campaigns(db: Session) -> list[dict]:
    rows = db.execute(
        select(Campaign).order_by(Campaign.priority.desc(), Campaign.id.desc())
    ).scalars().all()
    return [_to_dict(c) for c in rows]


def get_campaign(db: Session, slug: str) -> dict | None:
    row = db.execute(select(Campaign).where(Campaign.slug == slug)).scalar_one_or_none()
    return _to_dict(row) if row else None


def create(db: Session, data: dict) -> dict:
    title = (data.get("title") or "").strip()
    if not title:
        raise ValueError("Give the campaign a title")
    base = _slugify(data.get("slug") or title)
    slug, n = base, 2
    while db.execute(select(Campaign).where(Campaign.slug == slug)).scalar_one_or_none():
        slug, n = f"{base}-{n}", n + 1
    row = Campaign(**{**data, "title": title, "slug": slug})
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_dict(row)


def update(db: Session, campaign_id: int, data: dict) -> dict | None:
    row = db.get(Campaign, campaign_id)
    if not row:
        return None
    for key, value in data.items():
        if value is not None and hasattr(row, key) and key not in ("id", "slug"):
            setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return _to_dict(row)


def delete(db: Session, campaign_id: int) -> bool:
    row = db.get(Campaign, campaign_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def record_click(db: Session, slug: str) -> bool:
    row = db.execute(select(Campaign).where(Campaign.slug == slug)).scalar_one_or_none()
    if not row:
        return False
    row.clicks += 1
    db.commit()
    return True
