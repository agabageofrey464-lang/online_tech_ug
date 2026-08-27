"""Hourly campaign generation, and a strictly-rationed daily announcement.

Two different rhythms on purpose:

* The storefront BANNER refreshes every hour, so the shop always looks alive.
* Customers are only ANNOUNCED to (email + push) a maximum of twice a day,
  spaced apart. Nobody wants 24 notifications about the same shop.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.services import campaigns as campaign_service

logger = logging.getLogger("onlinetech.campaign_auto")

MAX_ANNOUNCEMENTS_PER_DAY = 2
MIN_HOURS_BETWEEN_ANNOUNCEMENTS = 5

# Campaign shapes built from what the shop actually sells. Each entry is a
# template; the hourly job rotates which ones are shown.
TEMPLATES: list[dict] = [
    {
        "program": "Online Tech Festival", "badge": "Super Saver", "badge_sub": "Sale",
        "title": "Enjoy FREE Setup", "pill": "ON LAPTOPS OVER UGX 1M",
        "note": "Windows, Office & antivirus installed free",
        "cta_label": "Shop laptops", "link_url": "/shop?cat=Laptops",
        "bg_color": "#6d28d9", "panel_color": "#FCDC04", "image_url": "/hero/hero-1.jpg",
        "push_title": "Free setup on laptops over UGX 1M 💻",
        "push_body": "Windows, Office & antivirus installed free. Tap to shop.",
    },
    {
        "program": "Online Tech Storage", "badge": "Storage", "badge_sub": "Week",
        "title": "1TB SSD Deals", "pill": "FROM UGX 580,000",
        "note": "Genuine Samsung, Kingston, Crucial & WD",
        "cta_label": "Shop storage", "link_url": "/shop?cat=Storage",
        "bg_color": "#0e7490", "panel_color": "#22d3ee", "image_url": "/hero/hero-3.jpg",
        "push_title": "1TB SSDs from UGX 580,000 ⚡",
        "push_body": "Genuine Samsung, Kingston & WD. Make your PC fly.",
    },
    {
        "program": "Online Tech Academy", "badge": "Learn", "badge_sub": "& Earn",
        "title": "Start Learning Free", "pill": "1ST LESSON ON US",
        "note": "Certificates you keep · pay per lesson from 5K",
        "cta_label": "Browse courses", "link_url": "/learn",
        "bg_color": "#c41c2e", "panel_color": "#fb7185", "image_url": "/hero/hero-4.jpg",
        "push_title": "Your first lesson is free 🎓",
        "push_body": "22 computer courses. Learn at your pace, get a certificate.",
    },
    {
        "program": "Online Tech Care", "badge": "Repairs", "badge_sub": "& Support",
        "title": "Fix It Today", "pill": "FROM UGX 30,000",
        "note": "Laptops, desktops & networks — onsite or remote",
        "cta_label": "Book a repair", "link_url": "/services#repairs-support",
        "bg_color": "#f15a29", "panel_color": "#282363", "image_url": "/hero/hero-5.jpg",
        "push_title": "Laptop acting up? Fix it today 🔧",
        "push_body": "Repairs from UGX 30,000 — free diagnosis, onsite or remote.",
    },
    {
        "program": "Online Tech Certified", "badge": "Certified", "badge_sub": "Pre-Owned",
        "title": "UK Used, Fully Tested", "pill": "WARRANTY INCLUDED",
        "note": "Premium business laptops at a fraction of new",
        "cta_label": "Shop deals", "link_url": "/shop?deals=1",
        "bg_color": "#00a651", "panel_color": "#FCDC04", "image_url": "/hero/hero-6.jpg",
        "push_title": "Premium laptops, half the price 💼",
        "push_body": "UK-used HP, Dell & Lenovo — tested, with warranty.",
    },
    {
        "program": "Online Tech Upgrades", "badge": "Upgrade", "badge_sub": "Week",
        "title": "Make It Fast Again", "pill": "RAM & SSD FITTED FREE",
        "note": "Breathe new life into the machine you already own",
        "cta_label": "Shop upgrades", "link_url": "/shop?cat=Components",
        "bg_color": "#282363", "panel_color": "#f15a29", "image_url": "/hero/hero-3.jpg",
        "push_title": "Slow laptop? Upgrade it, don't replace it 🚀",
        "push_body": "RAM & SSD fitted free when you buy from us.",
    },
]


def refresh_auto_campaigns(db: Session, now: datetime | None = None) -> dict:
    """Rebuild the auto campaign set for this hour. Hand-made campaigns are never
    touched — they simply outrank the generated ones."""
    now = now or datetime.utcnow()
    slot = int(now.timestamp() // 3600)  # advances every hour

    # Rotate a window of 3 templates through the list.
    picked = [TEMPLATES[(slot + i) % len(TEMPLATES)] for i in range(3)]

    # Clear last hour's generated set (keeps the table from growing forever).
    for old in db.execute(select(Campaign).where(Campaign.auto.is_(True))).scalars().all():
        db.delete(old)
    db.commit()

    created = []
    for rank, tpl in enumerate(picked):
        data = {k: v for k, v in tpl.items() if not k.startswith("push_")}
        data.update({
            "slug": f"auto-{slot}-{rank}",
            "small": "T&Cs Apply",
            "active": True,
            "auto": True,
            "placement": "home",
            # Below hand-made campaigns (which default to 0 or higher).
            "priority": -1 - rank,
        })
        row = Campaign(**data)
        db.add(row)
        created.append(tpl)
    db.commit()
    logger.info("Auto campaigns refreshed: %s", [t["title"] for t in created])
    return {"slot": slot, "created": len(created)}


def _announced_today(db: Session, now: datetime) -> list[Campaign]:
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return [
        c
        for c in db.execute(select(Campaign).where(Campaign.notified_at.is_not(None))).scalars().all()
        if c.notified_at and c.notified_at >= start
    ]


def due_for_announcement(db: Session, now: datetime | None = None) -> Campaign | None:
    """The campaign to announce right now, or None if we've already said enough
    today. Caps at 2/day and spaces them at least 5 hours apart."""
    now = now or datetime.utcnow()
    sent_today = _announced_today(db, now)
    if len(sent_today) >= MAX_ANNOUNCEMENTS_PER_DAY:
        return None
    if sent_today:
        last = max(c.notified_at for c in sent_today if c.notified_at)
        if now - last < timedelta(hours=MIN_HOURS_BETWEEN_ANNOUNCEMENTS):
            return None

    # Prefer a hand-made live campaign; otherwise the top auto one.
    live = campaign_service.live_campaigns(db, "home")
    for item in live:
        row = db.get(Campaign, item["id"])
        if row and row.notified_at is None:
            return row
    return None


def push_copy_for(row: Campaign) -> tuple[str, str]:
    """Notification wording — the template's own line if we generated it."""
    for tpl in TEMPLATES:
        if tpl["title"] == row.title:
            return tpl["push_title"], tpl["push_body"]
    title = row.title or "New offer at Online Tech Uganda"
    body = row.pill or row.note or "Tap to see what's new."
    return title, body
