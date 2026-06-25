"""Transactional email via Resend (https://resend.com).

Uses the REST API directly to avoid an extra SDK dependency. If no API key is
configured (e.g. local dev), emails are logged instead of sent.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("onlinetech.email")

RESEND_ENDPOINT = "https://api.resend.com/emails"


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    """Send an email. Returns True if sent (or logged in dev), False on error."""
    if not settings.resend_api_key:
        logger.info("[email:dev] To=%s Subject=%s\n%s", to, subject, html)
        return True

    payload: dict = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                RESEND_ENDPOINT,
                json=payload,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            )
            resp.raise_for_status()
            return True
    except httpx.HTTPError as exc:  # pragma: no cover - network dependent
        logger.error("Resend send failed: %s", exc)
        return False


def _ugx(amount: int) -> str:
    return f"UGX {int(amount):,}"


async def send_order_confirmation(order) -> bool:
    """Email the customer (and notify the shop) about a new order."""
    rows = "".join(
        f"<tr><td>{i.name}</td><td align='center'>{i.quantity}</td>"
        f"<td align='right'>{_ugx(int(i.line_total))}</td></tr>"
        for i in order.items
    )
    html = f"""
    <h2>Thank you for your order, {order.customer_name}!</h2>
    <p>Your order <b>{order.reference}</b> has been received.</p>
    <table cellpadding="6" style="border-collapse:collapse;width:100%">
      <tr><th align="left">Item</th><th>Qty</th><th align="right">Total</th></tr>
      {rows}
    </table>
    <p>Subtotal: {_ugx(int(order.subtotal))}<br/>
    Delivery: {_ugx(int(order.delivery_fee))}<br/>
    <b>Total: {_ugx(int(order.total))}</b></p>
    <p>Payment: {order.payment_method.replace("_", " ").title()} ({order.payment_status})</p>
    <p>We will contact you on {order.phone} to confirm delivery to {order.delivery_town or "your location"}.</p>
    <p>— Online Tech Uganda</p>
    """
    ok = True
    # Notify the shop inbox
    ok &= await send_email(
        to=settings.contact_inbox,
        subject=f"New order {order.reference} — {_ugx(int(order.total))}",
        html=html,
    )
    # Confirm to the customer if they gave an email
    if order.email:
        ok &= await send_email(
            to=order.email,
            subject=f"Your Online Tech Uganda order {order.reference}",
            html=html,
        )
    return ok


async def send_contact_notification(
    *, name: str, phone: str, email: str, subject: str, message: str
) -> bool:
    html = f"""
    <h2>New contact message — Online Tech Uganda</h2>
    <p><b>Name:</b> {name}</p>
    <p><b>Phone:</b> {phone}</p>
    <p><b>Email:</b> {email or "—"}</p>
    <p><b>Interested in:</b> {subject or "—"}</p>
    <p><b>Message:</b></p>
    <p>{message}</p>
    """
    return await send_email(
        to=settings.contact_inbox,
        subject=f"New inquiry: {subject or 'Website contact'}",
        html=html,
        reply_to=email or None,
    )
