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
from app.services import email_guard, email_theme
from app.services.email import send_email

logger = logging.getLogger(__name__)

CALL_LINE = f"{settings.company_phone} or {settings.company_phone_alt}"


def _wrap(heading: str, body_html: str, *, show_phones: bool = True) -> str:
    """One letterhead for everything we send — see services/email_theme.py."""
    return email_theme.shell(heading=heading, body_html=body_html, show_phones=show_phones)


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


def order_status_html(order, status: str, db=None) -> tuple[str, str]:
    """Subject and HTML for an order that has just changed status."""
    from app.services.email import _order_rows

    heading, line = ORDER_COPY.get(
        status, ("Update on your order", "There's an update on your order.")
    )

    body = (
        f'<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;'
        f'line-height:1.6;color:#222">Hello {order.customer_name},</p>'
        f'<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;'
        f'line-height:1.6;color:#6e6e6e">{line}</p>'
        f'<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6e6e6e">'
        f'Order <b style="color:#222">{order.reference}</b></p>'
        + email_theme.items_table(_order_rows(order, db))
        + email_theme.totals_table([], ("Total", email_theme.money(int(order.total))))
        + email_theme.button(
            "Track your order",
            f"{settings.site_url.rstrip('/')}/track?ref={order.reference}",
        )
    )
    return f"{heading} — {order.reference}", _wrap(heading, body)


async def order_status_changed(order, status: str, db=None) -> bool:
    """Tell the customer their order moved on. False if there was no address."""
    if not order.email or not email_guard.deliverable(order.email):
        return False
    subject, html = order_status_html(order, status, db)
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
