"""Web Push — browser/phone notifications for new stock, offers and discounts.

The storefront registers a service worker, asks the visitor for permission, and
sends us the resulting subscription. We push through that endpoint using our
VAPID keys. Dead endpoints (uninstalled app, cleared browser) return 404/410 and
are deactivated automatically so the list stays clean.
"""

import asyncio
import json
import logging
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.push_subscription import PushSubscription

logger = logging.getLogger("onlinetech.push")

# Marks a device as the owner's. Held in `email` because adding a column
# would need a migration, and create_all does not alter existing tables.
# The public subscribe endpoint refuses it, so a device can only be tagged
# this way through the admin-key route.
OWNER_TAG = "owner@device"


def configured() -> bool:
    return bool(settings.vapid_public_key and settings.vapid_private_key)


def save_subscription(db: Session, sub: dict, user_agent: str = "", email: str = "") -> dict:
    """Store (or refresh) a device's push subscription. Idempotent by endpoint."""
    if email == OWNER_TAG:
        raise ValueError("Invalid email")

    endpoint = (sub or {}).get("endpoint", "")
    keys = (sub or {}).get("keys", {}) or {}
    p256dh, auth = keys.get("p256dh", ""), keys.get("auth", "")
    if not endpoint or not p256dh or not auth:
        raise ValueError("Invalid push subscription")

    row = db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    ).scalar_one_or_none()
    if row:
        row.p256dh, row.auth, row.active = p256dh, auth, True
        if email:
            row.email = email
    else:
        row = PushSubscription(
            endpoint=endpoint, p256dh=p256dh, auth=auth,
            user_agent=user_agent[:255], email=email,
        )
        db.add(row)
    db.commit()
    return {"ok": True}


def remove_subscription(db: Session, endpoint: str) -> bool:
    row = db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    ).scalar_one_or_none()
    if not row:
        return False
    row.active = False
    db.commit()
    return True


def stats(db: Session) -> dict:
    total = db.execute(select(func.count()).select_from(PushSubscription)).scalar_one()
    active = db.execute(
        select(func.count()).select_from(PushSubscription).where(PushSubscription.active.is_(True))
    ).scalar_one()
    return {"total": total, "active": active, "enabled": configured()}


def _send_one(row: PushSubscription, payload: dict) -> tuple[bool, bool]:
    """Returns (sent, should_deactivate)."""
    from pywebpush import WebPushException, webpush

    try:
        webpush(
            subscription_info={
                "endpoint": row.endpoint,
                "keys": {"p256dh": row.p256dh, "auth": row.auth},
            },
            data=json.dumps(payload),
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_subject},
            timeout=10,
        )
        return True, False
    except WebPushException as exc:
        code = getattr(exc.response, "status_code", None)
        # 404/410 mean the device is gone for good — stop mailing a dead address.
        if code in (404, 410):
            return False, True
        logger.warning("Push failed (%s): %s", code, exc)
        return False, False
    except Exception as exc:  # noqa: BLE001
        logger.warning("Push error: %s", exc)
        return False, False


async def broadcast(db: Session, title: str, body: str, url: str = "/shop", image: str = "") -> dict:
    """Send one notification to every subscribed device."""
    if not configured():
        raise ValueError("Push notifications are not enabled yet.")
    if not title.strip():
        raise ValueError("Give the notification a title")

    payload = {
        "title": title.strip(),
        "body": body.strip(),
        "url": url or "/shop",
        "image": image or "",
    }
    rows = db.execute(
        select(PushSubscription).where(PushSubscription.active.is_(True))
    ).scalars().all()

    sent = failed = removed = 0
    now = datetime.utcnow()
    for row in rows:
        ok, dead = await asyncio.to_thread(_send_one, row, payload)
        if ok:
            sent += 1
            row.send_count += 1
            row.last_sent = now
        elif dead:
            row.active = False
            removed += 1
        else:
            failed += 1
    db.commit()
    return {"devices": len(rows), "sent": sent, "failed": failed, "removed": removed}


def save_owner_device(db: Session, sub: dict, user_agent: str = "") -> dict:
    """Tag this device as the owner's, so alerts reach it and nobody else's."""
    endpoint = (sub or {}).get("endpoint", "")
    keys = (sub or {}).get("keys", {}) or {}
    p256dh, auth = keys.get("p256dh", ""), keys.get("auth", "")
    if not endpoint or not p256dh or not auth:
        raise ValueError("Invalid push subscription")

    row = db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    ).scalar_one_or_none()
    if row:
        row.p256dh, row.auth, row.active, row.email = p256dh, auth, True, OWNER_TAG
    else:
        db.add(PushSubscription(
            endpoint=endpoint, p256dh=p256dh, auth=auth,
            user_agent=user_agent[:255], email=OWNER_TAG,
        ))
    db.commit()
    return {"ok": True}


def owner_devices(db: Session) -> int:
    return db.execute(
        select(func.count()).select_from(PushSubscription).where(
            PushSubscription.email == OWNER_TAG, PushSubscription.active.is_(True)
        )
    ).scalar_one()


async def notify_owner(db: Session, title: str, body: str = "", url: str = "/") -> dict:
    """Push an alert to the owner's own devices only.

    Never raises: an alert that fails must not fail the order, registration or
    application that triggered it.
    """
    if not configured():
        return {"sent": 0, "devices": 0}

    payload = {"title": title[:120], "body": body[:400], "url": url, "image": ""}
    rows = db.execute(
        select(PushSubscription).where(
            PushSubscription.email == OWNER_TAG, PushSubscription.active.is_(True)
        )
    ).scalars().all()

    sent = 0
    now = datetime.utcnow()
    for row in rows:
        try:
            ok, dead = await asyncio.to_thread(_send_one, row, payload)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Owner push error: %s", exc)
            continue
        if ok:
            sent += 1
            row.send_count += 1
            row.last_sent = now
        elif dead:
            row.active = False
    try:
        db.commit()
    except Exception:  # noqa: BLE001
        db.rollback()
    return {"sent": sent, "devices": len(rows)}
