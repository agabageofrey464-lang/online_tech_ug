"""One endpoint every admin inbox uses to reply to the person who wrote in.

Orders, leads, applications, enrolments, vendors and freelancers all end with
the same question: how do I tell this person where they stand? Rather than a
reply box per page, they all post here.

Email is sent from the server. WhatsApp comes back as a link for the admin to
tap, because messaging an arbitrary number from the server needs a paid
WhatsApp Business account — the link reaches them just as fast and costs
nothing.
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services import notify

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class FeedbackIn(BaseModel):
    name: str = Field(default="", max_length=160)
    email: str = Field(default="", max_length=254)
    phone: str = Field(default="", max_length=40)
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=2, max_length=4000)
    # Which way to reach them. The admin picks per message: an applicant with
    # a good email is best emailed, a customer who only left a number is not.
    channel: Literal["email", "whatsapp", "both"] = "both"


@router.post("/send", dependencies=[Depends(require_admin)])
async def send(payload: FeedbackIn) -> dict:
    """Email the person, and hand back a WhatsApp link for the same message."""
    emailed = False
    if payload.channel in ("email", "both"):
        emailed = await notify.send_feedback(
            name=payload.name,
            email=payload.email,
            subject=payload.subject,
            message=payload.message,
        )

    # The WhatsApp text carries the message as written, plus how to reach us.
    wa_text = (
        f"Hello {payload.name or 'there'},\n\n{payload.message.strip()}\n\n"
        f"— Online Tech Uganda\n{notify.CALL_LINE}"
    )
    wa = notify.whatsapp_url(payload.phone, wa_text) if payload.channel in ("whatsapp", "both") else ""

    if not emailed and not wa:
        raise HTTPException(
            status_code=400,
            detail="No usable email address or phone number for this person.",
        )

    return {
        "emailed": emailed,
        "whatsapp_url": wa,
        "email_skipped": payload.channel in ("email", "both") and bool(payload.email) and not emailed,
        "channel": payload.channel,
    }
