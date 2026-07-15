"""Subscription expiry — deactivate expired listings, notify the owner & sellers."""

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.advert import Advert
from app.models.freelancer import Freelancer
from app.models.user import User
from app.services.email import send_email


def set_subscription(db: Session, kind: str, item_id: int, days: int) -> dict:
    """Admin: set/extend a subscription (from now) and (re)activate the listing."""
    ends = datetime.utcnow() + timedelta(days=days)
    if kind == "vendor":
        row = db.get(User, item_id)
        if not row or row.role != "vendor":
            return {}
        row.subscription_ends = ends
        row.vendor_approved = True
    elif kind == "freelancer":
        row = db.get(Freelancer, item_id)
        if not row:
            return {}
        row.subscription_ends = ends
        row.approved = True
    elif kind == "advert":
        row = db.get(Advert, item_id)
        if not row:
            return {}
        row.subscription_ends = ends
        row.active = True
    else:
        return {}
    db.commit()
    return {"id": item_id, "kind": kind, "subscription_ends": ends.isoformat()}


def _fmt(d: datetime | None) -> str:
    return d.strftime("%d %b %Y") if d else ""


async def sweep(db: Session) -> dict:
    """Deactivate expired listings, notify the owner + sellers. Returns a summary."""
    now = datetime.utcnow()
    soon = now + timedelta(days=3)
    expired: dict[str, list] = {"vendors": [], "freelancers": [], "adverts": []}
    expiring: dict[str, list] = {"vendors": [], "freelancers": [], "adverts": []}

    for u in db.execute(
        select(User).where(User.role == "vendor", User.vendor_approved.is_(True), User.subscription_ends.isnot(None))
    ).scalars():
        if u.subscription_ends < now:
            u.vendor_approved = False
            expired["vendors"].append(u)
        elif u.subscription_ends < soon:
            expiring["vendors"].append(u)

    for f in db.execute(
        select(Freelancer).where(Freelancer.approved.is_(True), Freelancer.subscription_ends.isnot(None))
    ).scalars():
        if f.subscription_ends < now:
            f.approved = False
            expired["freelancers"].append(f)
        elif f.subscription_ends < soon:
            expiring["freelancers"].append(f)

    for a in db.execute(
        select(Advert).where(Advert.active.is_(True), Advert.subscription_ends.isnot(None))
    ).scalars():
        if a.subscription_ends < now:
            a.active = False
            expired["adverts"].append(a)
        elif a.subscription_ends < soon:
            expiring["adverts"].append(a)

    db.commit()

    total_expired = sum(len(v) for v in expired.values())
    total_soon = sum(len(v) for v in expiring.values())

    # Notify the owner if anything changed / is coming up.
    if total_expired or total_soon:
        lines: list[str] = []
        if total_expired:
            lines.append("<b>Deactivated (expired):</b>")
            lines += [f"• Vendor: {u.business_name or u.name} ({u.phone})" for u in expired["vendors"]]
            lines += [f"• Freelancer: {f.name} ({f.phone})" for f in expired["freelancers"]]
            lines += [f"• Advert: {a.title} — {a.advertiser}" for a in expired["adverts"]]
        if total_soon:
            lines.append("<br><b>Expiring within 3 days:</b>")
            lines += [f"• Vendor: {u.business_name or u.name} — ends {_fmt(u.subscription_ends)}" for u in expiring["vendors"]]
            lines += [f"• Freelancer: {f.name} — ends {_fmt(f.subscription_ends)}" for f in expiring["freelancers"]]
            lines += [f"• Advert: {a.title} — ends {_fmt(a.subscription_ends)}" for a in expiring["adverts"]]
        html = "<h2>Subscription update</h2><p>" + "<br>".join(lines) + "</p>"
        try:
            await send_email(
                to=settings.contact_inbox,
                subject=f"⏳ Subscriptions: {total_expired} expired, {total_soon} expiring soon",
                html=html,
            )
        except Exception:  # noqa: BLE001
            pass

    # Renewal reminders to sellers with an email on file.
    for u in expired["vendors"]:
        if u.email:
            try:
                await send_email(to=u.email, subject="Your vendor listing has expired — renew to stay live",
                    html=f"<p>Hi {u.name},</p><p>Your vendor subscription on Online Tech Uganda has ended, so your products are now hidden. Contact us to renew and go live again.</p>")
            except Exception:  # noqa: BLE001
                pass
    for f in expired["freelancers"]:
        if f.email:
            try:
                await send_email(to=f.email, subject="Your freelancer listing has expired — renew to stay listed",
                    html=f"<p>Hi {f.name},</p><p>Your listing in the Online Tech Uganda freelancers directory has ended. Contact us to renew and stay listed.</p>")
            except Exception:  # noqa: BLE001
                pass

    return {
        "expired": {k: len(v) for k, v in expired.items()},
        "expiring_soon": {k: len(v) for k, v in expiring.items()},
    }
