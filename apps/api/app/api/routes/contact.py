import logging
import re
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate
from app.services import push, whatsapp
from app.services.email import send_contact_notification, send_request_received

logger = logging.getLogger("onlinetech.contact")
router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", dependencies=[Depends(require_admin)])
def list_contacts(db: Session = Depends(get_db)) -> list[dict]:
    """Admin: contact / lead messages, newest first."""
    rows = db.execute(select(ContactMessage).order_by(ContactMessage.id.desc())).scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "phone": r.phone,
            "email": r.email,
            "subject": r.subject,
            "message": r.message,
            "handled": r.handled,
        }
        for r in rows
    ]


# An open form on a public site attracts bots, and every submission was
# emailing the owner. These are the cheap checks that stop the bulk of it
# without putting a captcha in front of a real customer.
_LINK = re.compile(r"https?://|www\.", re.I)
_SPAM_WORDS = re.compile(
    r"(seo service|backlink|crypto|forex|casino|viagra|loan offer|bitcoin|"
    r"rank higher|guest post|click here now)",
    re.I,
)
MAX_PER_HOUR = 3  # per phone/email — a real person rarely needs more


def _looks_like_spam(payload: ContactCreate) -> str | None:
    body = f"{payload.subject or ''} {payload.message or ''}".strip()
    if len(body) < 10:
        return "Please write a little more so we can help."
    if _SPAM_WORDS.search(body):
        return "That message looks like spam. Contact us on WhatsApp instead."
    # Several links in a short message is the classic pattern.
    if len(_LINK.findall(body)) >= 2 and len(body) < 400:
        return "Messages that are mostly links aren't accepted."
    if not (payload.phone or payload.email):
        return "Please leave a phone number or email so we can reply."
    return None


def _too_many(db: Session, payload: ContactCreate) -> bool:
    who = str(payload.email or "").strip().lower() or (payload.phone or "").strip()
    if not who:
        return False
    since = datetime.utcnow() - timedelta(hours=1)
    try:
        n = db.execute(
            select(func.count())
            .select_from(ContactMessage)
            .where(
                ContactMessage.created_at >= since,
                (func.lower(ContactMessage.email) == who) | (ContactMessage.phone == who),
            )
        ).scalar_one()
    except SQLAlchemyError:
        db.rollback()
        return False
    return n >= MAX_PER_HOUR


@router.post("", status_code=201)
async def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> dict:
    """Receive a contact message: persist it (best effort) and notify by email.

    Spam is stored but never emailed, so the owner's inbox stays useful."""
    reject = _looks_like_spam(payload)
    if reject:
        raise HTTPException(status_code=400, detail=reject)

    flooding = _too_many(db, payload)

    saved_id: int | None = None
    try:
        msg = ContactMessage(
            name=payload.name,
            phone=payload.phone,
            email=str(payload.email or ""),
            subject=payload.subject,
            message=payload.message,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        saved_id = msg.id
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Could not persist contact message: %s", exc)

    # Held back rather than dropped — it is saved and visible in the admin, it
    # just doesn't add another email to the pile.
    if flooding:
        logger.info("Contact message saved but not emailed (rate limit): %s", payload.phone or payload.email)
    else:
        await send_contact_notification(
            name=payload.name,
            phone=payload.phone,
            email=str(payload.email or ""),
            subject=payload.subject,
            message=payload.message,
        )

    # Something the sender can quote back to us, and a written receipt so the
    # form visibly did something. A failed email must not fail the request:
    # it is already saved and the owner has already been told.
    reference = f"OTU-Q{saved_id:05d}" if saved_id else ""

    # Same reasoning as an order: tell the owner on the channel they watch.
    # Spam and floods are already filtered out above, so this stays useful.
    if not flooding:
        await whatsapp.notify_owner(
            whatsapp.request_message(
                subject=payload.subject,
                reference=reference or "—",
                name=payload.name,
                phone=payload.phone,
                email=str(payload.email or ""),
                message=payload.message,
            )
        )

        await push.notify_owner(
            db,
            f"📩 New request {reference}",
            f"{payload.subject or 'Enquiry'} · {payload.name} · {payload.phone}",
            "/leads",
        )

    emailed = False
    if payload.email and reference and not flooding:
        try:
            emailed = await send_request_received(
                to=str(payload.email),
                name=payload.name,
                subject=payload.subject,
                reference=reference,
                summary=payload.message[:600],
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not send the request receipt: %s", exc)

    return {
        "ok": True,
        "id": saved_id,
        "reference": reference,
        "emailed": emailed,
        "message": "Thank you! We'll get back to you shortly.",
    }
