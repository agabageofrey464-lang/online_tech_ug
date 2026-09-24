"""Marketing list: new stock, offers and discounts sent to people who asked for them.

Subscribers come from the storefront newsletter box and from customer accounts.
Every broadcast carries a working unsubscribe link — required for trust and for
staying out of spam folders.
"""

import asyncio
import logging
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services import email_guard, email_theme
from app.models.subscriber import Subscriber
from app.models.user import User
from app.services.email import send_email

logger = logging.getLogger("onlinetech.newsletter")


def _to_dict(s: Subscriber) -> dict:
    return {
        "id": s.id,
        "email": s.email,
        "name": s.name,
        "source": s.source,
        "active": s.active,
        "send_count": s.send_count,
        "last_sent": s.last_sent,
        "created_at": s.created_at,
    }


def subscribe(db: Session, email: str, name: str = "", source: str = "website") -> dict:
    """Add (or re-activate) an address. Idempotent — signing up twice is fine."""
    addr = email.strip().lower()
    reason = email_guard.problem(addr)
    if reason:
        hint = email_guard.suggest(addr)
        if hint:
            raise ValueError(f"That address looks like a typo — did you mean {hint}?")
        raise ValueError("Please enter a valid email address")
    row = db.execute(select(Subscriber).where(Subscriber.email == addr)).scalar_one_or_none()
    if row:
        if not row.active:
            row.active = True  # they came back
        if name and not row.name:
            row.name = name.strip()
        db.commit()
        return _to_dict(row)
    row = Subscriber(email=addr, name=name.strip(), source=source)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_dict(row)


def unsubscribe(db: Session, token: str) -> bool:
    row = db.execute(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    ).scalar_one_or_none()
    if not row:
        return False
    row.active = False
    db.commit()
    return True


def list_subscribers(db: Session, active_only: bool = False) -> list[dict]:
    stmt = select(Subscriber).order_by(Subscriber.created_at.desc())
    if active_only:
        stmt = stmt.where(Subscriber.active.is_(True))
    return [_to_dict(r) for r in db.execute(stmt).scalars().all()]


def stats(db: Session) -> dict:
    total = db.execute(select(func.count()).select_from(Subscriber)).scalar_one()
    active = db.execute(
        select(func.count()).select_from(Subscriber).where(Subscriber.active.is_(True))
    ).scalar_one()
    customers = db.execute(
        select(func.count()).select_from(User).where(User.email != "")
    ).scalar_one()
    return {"total": total, "active": active, "customers": customers}


def _recipients(db: Session, include_customers: bool) -> list[tuple[str, str, str]]:
    """(email, name, unsubscribe_token) for everyone who should get this send."""
    out: dict[str, tuple[str, str, str]] = {}
    for s in db.execute(select(Subscriber).where(Subscriber.active.is_(True))).scalars().all():
        out[s.email.lower()] = (s.email, s.name, s.unsubscribe_token)
    if include_customers:
        for u in db.execute(select(User).where(User.email != "")).scalars().all():
            key = u.email.lower()
            if key not in out:
                # Customers are emailed as account holders; they can opt out by
                # subscribing then unsubscribing, or by asking us.
                out[key] = (u.email, u.name or "", "")
    return list(out.values())


def _wrap(body_html: str, name: str, token: str) -> str:
    """Brand the message and append the unsubscribe footer.

    Uses the same letterhead as our order mail — a campaign that looks
    different from a receipt reads as a different sender, which is how
    legitimate mail ends up in a spam folder.
    """
    greeting = email_theme.text(f"Hi {name},") if name else ""

    unsub = (
        f'<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;'
        f'color:#6e6e6e;text-align:center">You are receiving this because you asked for updates '
        f'from Online Tech Uganda. '
        f'<a href="{settings.site_url}/unsubscribe?token={token}" '
        f'style="color:#6e6e6e">Unsubscribe</a>.</p>'
        if token
        else '<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;'
        'color:#6e6e6e;text-align:center">You are receiving this as an Online Tech Uganda customer.</p>'
    )

    return email_theme.shell(
        heading="From Online Tech Uganda",
        body_html=greeting
        + body_html
        + email_theme.button("Shop now", f"{settings.site_url.rstrip('/')}/shop")
        + unsub,
        show_phones=False,
    )


async def broadcast(db: Session, subject: str, body_html: str, include_customers: bool = True) -> dict:
    """Send one campaign to the list. Returns how many were sent / failed."""
    if not subject.strip():
        raise ValueError("Give the message a subject")
    if not body_html.strip():
        raise ValueError("The message body is empty")

    people = _recipients(db, include_customers)
    sent = failed = 0
    for email, name, token in people:
        try:
            ok = await send_email(to=email, subject=subject, html=_wrap(body_html, name, token))
            sent += 1 if ok else 0
            failed += 0 if ok else 1
        except Exception as exc:  # noqa: BLE001
            failed += 1
            logger.warning("Newsletter send failed for %s: %s", email, exc)
        await asyncio.sleep(0.15)  # be gentle with the SMTP provider

    now = datetime.utcnow()
    for s in db.execute(select(Subscriber).where(Subscriber.active.is_(True))).scalars().all():
        s.send_count += 1
        s.last_sent = now
    db.commit()
    return {"recipients": len(people), "sent": sent, "failed": failed}
