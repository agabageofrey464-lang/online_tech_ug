"""Hourly campaign generation, and a strictly-rationed daily announcement.

Two different rhythms on purpose:

* The storefront BANNER refreshes every hour, so the shop always looks alive.
* Customers get two to three PUSH notifications a day, spaced apart, and at
  most ONE campaign EMAIL a day. Nobody wants 24 notifications about the
  same shop, and an inbox is less forgiving than a lock screen.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.services import campaigns as campaign_service

logger = logging.getLogger("onlinetech.campaign_auto")

# A notification every three hours through the waking day, Kampala time:
# 9am, noon, 3pm, 6pm and 9pm. Nothing overnight.
#
# This used to allow three, counted from midnight UTC with a three-hour gap —
# which is 3am in Kampala. The first went out around 03:45, the second at
# 06:45 and the third at 09:45, every day: two of the three while people
# slept, and nothing at all in the afternoon or evening when they shop.
KAMPALA = timedelta(hours=3)  # East Africa Time; no daylight saving
ANNOUNCEMENT_HOURS = (9, 12, 15, 18, 21)  # the earliest Kampala hour for each of the day's sends
MAX_ANNOUNCEMENTS_PER_DAY = len(ANNOUNCEMENT_HOURS)

# A push notification is a glance; an email sits in the inbox. Three a day is
# fine on the phone but reads as spam by email, so email gets its own, tighter
# cap: one per day, on the first announcement of the day.
MAX_EMAILS_PER_DAY = 1

# Campaign shapes built from what the shop actually sells. Each entry is a
# template; the hourly job rotates which ones are shown.
TEMPLATES: list[dict] = [
    {
        "program": "Online Tech Festival", "badge": "Super Saver", "badge_sub": "Sale",
        "title": "Enjoy FREE Setup", "pill": "ON LAPTOPS OVER UGX 1M",
        "note": "Windows, Office & antivirus installed free",
        "cta_label": "Shop laptops", "link_url": "/shop?cat=Laptops",
        "bg_color": "#0e7490", "panel_color": "#FCDC04", "image_url": "/hero/hero-1.jpg",
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
        "title": "Learn A New Skill", "pill": "LESSONS FROM UGX 5,000",
        "note": "22 courses · physical or online · certificate included",
        "cta_label": "Browse courses", "link_url": "/learn",
        "bg_color": "#0c5d75", "panel_color": "#22d3ee", "image_url": "/hero/hero-4.jpg",
        "push_title": "22 computer courses, lessons from UGX 5,000 🎓",
        "push_body": "Physical or online. Learn at your pace, get a certificate.",
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

    # Clear last hour's generated set, but never the rows that record what we
    # have already announced — the daily cap and the three-hour gap are read
    # off their notified_at, so deleting them resets the limits every hour.
    cutoff = now - timedelta(days=7)
    for old in db.execute(select(Campaign).where(Campaign.auto.is_(True))).scalars().all():
        if old.notified_at is None or old.notified_at < cutoff:
            db.delete(old)
        else:
            old.active = False  # keep the record, stop showing it
            if not old.slug.startswith("sent-"):
                old.slug = f"sent-{old.id}-{old.slug}"[:160]
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
    # "Today" is the day in Kampala, not in UTC.
    local = now + KAMPALA
    start = local.replace(hour=0, minute=0, second=0, microsecond=0) - KAMPALA
    return [
        c
        for c in db.execute(select(Campaign).where(Campaign.notified_at.is_not(None))).scalars().all()
        if c.notified_at and c.notified_at >= start
    ]


def due_for_announcement(db: Session, now: datetime | None = None) -> Campaign | None:
    """The campaign to announce right now, or None if we've already said enough
    today. One every three hours from 09:00 to 21:00, Kampala time. The worker
    looks hourly, so each goes out within the hour after its slot opens."""
    now = now or datetime.utcnow()
    sent_today = _announced_today(db, now)
    if len(sent_today) >= MAX_ANNOUNCEMENTS_PER_DAY:
        return None
    if (now + KAMPALA).hour < ANNOUNCEMENT_HOURS[len(sent_today)]:
        return None

    # Prefer a hand-made live campaign; otherwise the top auto one.
    live = campaign_service.live_campaigns(db, "home")
    for item in live:
        row = db.get(Campaign, item["id"])
        if row and row.notified_at is None:
            return row
    return None


def should_email(db: Session, now: datetime | None = None) -> bool:
    """True if we haven't already emailed a campaign today. Push can go out 2-3
    times a day, but the email version is capped at one."""
    now = now or datetime.utcnow()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    emailed_today = [
        c
        for c in db.execute(select(Campaign).where(Campaign.emailed_at.is_not(None))).scalars().all()
        if c.emailed_at and c.emailed_at >= start
    ]
    return len(emailed_today) < MAX_EMAILS_PER_DAY


def push_copy_for(row: Campaign) -> tuple[str, str]:
    """Notification wording — the template's own line if we generated it."""
    for tpl in TEMPLATES:
        if tpl["title"] == row.title:
            return tpl["push_title"], tpl["push_body"]
    title = row.title or "New offer at Online Tech Uganda"
    body = row.pill or row.note or "Tap to see what's new."
    return title, body
