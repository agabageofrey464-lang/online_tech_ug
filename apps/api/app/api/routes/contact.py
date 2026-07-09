import logging

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate
from app.services.email import send_contact_notification

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


@router.post("", status_code=201)
async def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> dict:
    """Receive a contact message: persist it (best effort) and notify by email."""
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

    await send_contact_notification(
        name=payload.name,
        phone=payload.phone,
        email=str(payload.email or ""),
        subject=payload.subject,
        message=payload.message,
    )

    return {"ok": True, "id": saved_id, "message": "Thank you! We'll get back to you shortly."}
