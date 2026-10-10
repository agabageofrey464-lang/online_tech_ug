"""Send the owner a WhatsApp message when something needs their attention.

Email already goes to the shop inbox, but an inbox is checked when someone
remembers to check it. An order that arrives on WhatsApp gets acted on.

This uses CallMeBot, which needs no business account and no monthly fee — the
owner sends one authorisation message to the bot once and gets an API key. Set
OWNER_WHATSAPP_PHONE and OWNER_WHATSAPP_API_KEY and it starts working; leave
them blank and every call here is a no-op, so nothing breaks without them.

Sending must never block or fail an order: a customer who has just paid should
not see an error because a notification didn't go out.
"""

from __future__ import annotations

import re

import logging
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

ENDPOINT = "https://api.callmebot.com/whatsapp.php"
TIMEOUT = 8.0


def configured() -> bool:
    return bool(settings.owner_whatsapp_phone and settings.owner_whatsapp_api_key)


async def notify_owner(text: str) -> bool:
    """Send `text` to the owner's WhatsApp. Returns False if it didn't go."""
    if not configured():
        return False

    phone = settings.owner_whatsapp_phone.lstrip("+").replace(" ", "")
    params = {
        "phone": phone,
        "text": text[:900],  # the relay truncates long messages anyway
        "apikey": settings.owner_whatsapp_api_key,
    }
    url = f"{ENDPOINT}?phone={params['phone']}&text={quote(params['text'])}&apikey={params['apikey']}"

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            res = await client.get(url)
        if res.status_code >= 400:
            logger.warning("WhatsApp notify failed (%s): %s", res.status_code, res.text[:200])
            return False
        return True
    except Exception as exc:  # noqa: BLE001 — never let this break the caller
        logger.warning("WhatsApp notify error: %s", exc)
        return False


# The storefront's test for a phone, by name (apps/web/src/lib/vendor-items.ts).
_PHONE = re.compile(r"\b(i\s?phone|galaxy|samsung\s+[sa]\d|redmi|xiaomi|tecno|infinix|itel|oppo|vivo|honor|huawei|nokia|pixel|oneplus|realme|smart\s?phone|phone|tablets?|ipad|tab\s?\d)\b", re.I)
_NOT_PHONE = re.compile(r"\b(case|cover|charger|cable|protector|holder|stand|earphone|headphone|power\s?bank|adapter|screen\s?guard|pouch)\b", re.I)


def _is_phone(name: str) -> bool:
    return bool(_PHONE.search(name or "")) and not _NOT_PHONE.search(name or "")


def order_message(order) -> str:
    """The order, written so it reads properly in a WhatsApp notification."""
    lines = [f"🛒 NEW ORDER  {order.reference}", ""]
    for i in order.items:
        lines.append(f"• {i.quantity} x {i.name} — UGX {int(i.line_total):,}")
    if any(_is_phone(i.name) for i in order.items):
        lines.append(f"📱 Has a phone — phone orders are handled on {settings.phone_orders_line}")
    lines += [
        "",
        f"Total: UGX {int(order.total):,}",
        f"Payment: {order.payment_method.replace('_', ' ').title()} ({order.payment_status})",
        "",
        f"{order.customer_name} — {order.phone}",
    ]
    if order.delivery_town:
        lines.append(f"Deliver to: {order.delivery_town}")
    if order.delivery_address:
        lines.append(order.delivery_address)
    # Their pin, as a link that opens in Google Maps for whoever delivers it.
    if getattr(order, "delivery_lat", None) is not None and getattr(order, "delivery_lng", None) is not None:
        km = getattr(order, "delivery_km", None)
        lines.append(f"Map: https://www.google.com/maps?q={order.delivery_lat:.6f},{order.delivery_lng:.6f}" + (f" ({km:g} km, transport UGX {int(order.delivery_fee):,})" if km else ""))
    if order.notes:
        lines.append(f"Note: {order.notes}")
    return "\n".join(lines)


def registration_message(
    *,
    course_title: str,
    reference: str,
    name: str,
    phone: str,
    email: str = "",
    price: int = 0,
    code: str = "",
) -> str:
    """A course registration, written for a phone screen."""
    lines = [f"🎓 NEW REGISTRATION  {reference}", "", course_title]
    if price:
        lines.append(f"Fee: UGX {price:,}")
    lines += ["", f"{name} — {phone}"]
    if email:
        lines.append(email)
    if code:
        lines += ["", f"Unlock code: {code}", "(send it once payment is confirmed)"]
    lines += ["", "Approve it in Admin › Enrollments."]
    return "\n".join(lines)


def request_message(
    *, subject: str, reference: str, name: str, phone: str, email: str = "", message: str = ""
) -> str:
    """A client request — software, a quote, a vendor application."""
    lines = [f"📩 NEW REQUEST  {reference}", "", subject or "General enquiry", ""]
    lines.append(f"{name} — {phone}")
    if email:
        lines.append(email)
    if message:
        # Enough to judge whether it needs answering now, not the whole brief.
        trimmed = message.strip().replace("\r", "")
        lines += ["", trimmed[:300] + ("…" if len(trimmed) > 300 else "")]
    lines += ["", "It's in Admin › Leads."]
    return "\n".join(lines)


def alert_message(
    *,
    icon: str,
    title: str,
    reference: str = "",
    pairs: list[tuple[str, str]],
    note: str = "",
    where: str = "",
) -> str:
    """One shape for every "something arrived" alert.

    Written for a phone screen: what it is, who it's from, and where to go
    and deal with it. Anything longer gets skimmed and forgotten.
    """
    head = f"{icon} {title.upper()}"
    if reference:
        head += f"  {reference}"
    lines = [head, ""]
    lines += [f"{k}: {v}" for k, v in pairs if v]
    if note:
        trimmed = note.strip().replace("\r", "")
        lines += ["", trimmed[:280] + ("…" if len(trimmed) > 280 else "")]
    if where:
        lines += ["", where]
    return "\n".join(lines)
