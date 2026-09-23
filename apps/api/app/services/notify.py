"""Messages we send to a customer or applicant, and the one way we send them.

Every admin inbox — orders, leads, applications, enrolments, vendors,
freelancers — needs the same thing: tell this person where they stand, by
email, and give the admin a WhatsApp link for the ones who'd rather be
messaged. Doing that in one place means the wording, the signature and the
phone numbers stay the same wherever it is sent from.

A notification must never fail the action that triggered it. Every function
here returns a result; none of them raise.
"""

from __future__ import annotations

import logging
from urllib.parse import quote

from app.core.config import settings
from app.services import email_guard
from app.services.email import send_email

logger = logging.getLogger(__name__)

CALL_LINE = f"{settings.company_phone} or {settings.company_phone_alt}"


def _wrap(heading: str, body_html: str, *, show_phones: bool = True) -> str:
    phones = (
        f"""
      <p style="margin:18px 0 0;padding:12px 14px;background:#eefafd;border-radius:8px;
                color:#0c5d75;font-size:14px">
        <b>Call us to confirm:</b><br/>
        <a href="tel:{settings.company_phone.replace(' ', '')}"
           style="color:#0e7490;text-decoration:none">{settings.company_phone}</a>
        &nbsp;·&nbsp;
        <a href="tel:{settings.company_phone_alt.replace(' ', '')}"
           style="color:#0e7490;text-decoration:none">{settings.company_phone_alt}</a>
      </p>"""
        if show_phones
        else ""
    )

    return f"""
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#222">
      <h2 style="color:#0e7490;margin:0 0 12px">{heading}</h2>
      {body_html}
      {phones}
      <p style="margin:20px 0 0;color:#888;font-size:13px">
        Online Tech Uganda · Kampala<br/>
        <a href="mailto:{settings.contact_inbox}" style="color:#888">{settings.contact_inbox}</a>
      </p>
    </div>
    """


# ── Order status ────────────────────────────────────────────────────────────
# What each step actually means to the person waiting for their laptop.
ORDER_COPY: dict[str, tuple[str, str]] = {
    "confirmed": (
        "Your order is confirmed",
        "We've checked your order and it's confirmed. We're preparing it now "
        "and will call you to arrange delivery.",
    ),
    "processing": (
        "We're preparing your order",
        "Your order is being prepared. We'll let you know the moment it's "
        "ready, and call you to agree a delivery time.",
    ),
    "shipped": (
        "Your order is on the way",
        "Your order has left us and is on its way to you. Our driver will call "
        "you shortly before arriving.",
    ),
    "delivered": (
        "Your order has been delivered",
        "Your order has been delivered — thank you for buying from us. If "
        "anything isn't right, call us and we'll sort it out.",
    ),
    "cancelled": (
        "Your order has been cancelled",
        "Your order has been cancelled. If this wasn't what you expected, "
        "please call us — we'd rather fix it than lose you.",
    ),
}


def order_status_html(order, status: str) -> tuple[str, str]:
    """Subject and HTML for an order that has just changed status."""
    heading, line = ORDER_COPY.get(
        status, ("Update on your order", "There's an update on your order.")
    )

    rows = "".join(
        f"<tr><td style='padding:4px 0'>{i.quantity} × {i.name}</td>"
        f"<td align='right' style='padding:4px 0'>UGX {int(i.line_total):,}</td></tr>"
        for i in order.items
    )

    body = f"""
      <p style="font-size:15px">Hello {order.customer_name},</p>
      <p style="font-size:15px">{line}</p>
      <p style="margin:16px 0 4px;font-size:13px;color:#666">
        Order <b style="color:#222">{order.reference}</b>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">{rows}</table>
      <p style="margin:10px 0 0;font-size:15px"><b>Total: UGX {int(order.total):,}</b></p>
    """
    return f"{heading} — {order.reference}", _wrap(heading, body)


async def order_status_changed(order, status: str) -> bool:
    """Tell the customer their order moved on. False if there was no address."""
    if not order.email or not email_guard.deliverable(order.email):
        return False
    subject, html = order_status_html(order, status)
    return await send_email(to=order.email, subject=subject, html=html)


# ── Free-text feedback from any admin inbox ─────────────────────────────────
async def send_feedback(*, name: str, email: str, subject: str, message: str) -> bool:
    """Send an admin-written reply to a customer or applicant."""
    if not email or not email_guard.deliverable(email):
        return False

    paragraphs = "".join(
        f"<p style='font-size:15px;white-space:pre-wrap'>{p}</p>"
        for p in message.strip().split("\n\n")
        if p.strip()
    )
    body = f"<p style='font-size:15px'>Hello {name or 'there'},</p>{paragraphs}"
    return await send_email(to=email, subject=subject or "Online Tech Uganda", html=_wrap(subject or "Online Tech Uganda", body))


def whatsapp_url(phone: str, message: str) -> str:
    """A link the admin taps to send this message from their own WhatsApp.

    Messaging an arbitrary customer from the server needs a paid WhatsApp
    Business account. A deep link costs nothing and reaches them just as fast.
    """
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    if not digits:
        return ""
    if digits.startswith("0"):
        digits = "256" + digits[1:]
    elif not digits.startswith("256"):
        digits = "256" + digits.lstrip("+")
    return f"https://wa.me/{digits}?text={quote(message[:1200])}"
