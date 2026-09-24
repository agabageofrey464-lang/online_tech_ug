"""Transactional email.

Prefers Gmail SMTP (sends to anyone, from the business Gmail) when a Gmail app
password is configured; otherwise falls back to Resend, or logs in dev.
"""

import asyncio
import logging
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import settings
from app.services import email_guard, email_theme

logger = logging.getLogger("onlinetech.email")

RESEND_ENDPOINT = "https://api.resend.com/emails"


def _send_gmail(to: str, subject: str, html: str, reply_to: str | None) -> bool:
    """Blocking Gmail SMTP send (run in a thread)."""
    msg = EmailMessage()
    msg["From"] = f"Online Tech Uganda <{settings.gmail_user}>"
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content("This message requires an HTML-capable email client.")
    msg.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(settings.gmail_user, settings.gmail_app_password)
            server.send_message(msg)
        return True
    except Exception as exc:  # noqa: BLE001 - network/auth dependent
        logger.error("Gmail send failed: %s", exc)
        return False


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    """Send an email. Returns True if sent (or logged in dev), False on error."""
    # Mail to an address that doesn't exist comes back as a bounce in the
    # company inbox, every time, for as long as the address stays on the list.
    # Checking here covers every sender in the app at once.
    reason = email_guard.problem(to)
    if reason:
        hint = email_guard.suggest(to)
        logger.info(
            "Email skipped — %s: %s%s", reason, to,
            f" (did they mean {hint}?)" if hint else "",
        )
        return False

    # 1) Gmail SMTP (delivers to any recipient) if configured.
    if settings.gmail_user and settings.gmail_app_password:
        return await asyncio.to_thread(_send_gmail, to, subject, html, reply_to)

    # 2) Resend fallback.
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


def _order_rows(order, db=None) -> list[dict]:
    """The order's items, each with a photo to show alongside it.

    Item rows store a slug, not a picture, so the catalogue is asked for one.
    A missing photo is not worth failing an order confirmation over.
    """
    from app.services import catalog

    rows = []
    for i in order.items:
        image = ""
        try:
            product = catalog.get_product(db, i.product_slug)
            if product:
                image = product.get("image_url", "") or ""
        except Exception:  # noqa: BLE001 — a thumbnail is never worth an error
            image = ""
        rows.append(
            {
                "name": i.name,
                "quantity": int(i.quantity),
                "unit_price": int(i.unit_price),
                "line_total": int(i.line_total),
                "image_url": image,
            }
        )
    return rows


async def send_order_confirmation(order, db=None) -> bool:
    """Email the customer (and notify the shop) about a new order."""
    rows = _order_rows(order, db)

    totals = [("Subtotal", _ugx(int(order.subtotal)))]
    if int(getattr(order, "discount", 0) or 0):
        totals.append(("Discount", f"-{_ugx(int(order.discount))}"))
    totals.append(
        ("Delivery", "Free" if int(order.delivery_fee) == 0 else _ugx(int(order.delivery_fee)))
    )

    where = order.delivery_town or "your location"
    method = order.payment_method.replace("_", " ").title()

    body = (
        email_theme.items_table(rows)
        + email_theme.totals_table(totals, ("Total", _ugx(int(order.total))))
        + email_theme.panel(
            "Delivery",
            f"We&rsquo;ll call you on <b>{order.phone}</b> to confirm delivery to "
            f"<b>{where}</b>.<br />We deliver orders that have been paid for &mdash; "
            f"or you&rsquo;re welcome to collect from our shop in Kampala.",
        )
        + email_theme.panel(
            "Payment",
            f"{method} &middot; {order.payment_status}",
            accent=email_theme.ORANGE,
        )
        + email_theme.button("Track your order", f"{settings.site_url.rstrip('/')}/track?ref={order.reference}")
    )

    customer_html = email_theme.shell(
        heading=f"Thank you for your order, {order.customer_name}",
        intro=f"We&rsquo;ve received order <b>{order.reference}</b> and it&rsquo;s with our team now.",
        body_html=body,
    )

    ok = True
    # The shop's own copy — same figures, headed so it reads as an alert.
    ok &= await send_email(
        to=settings.contact_inbox,
        subject=f"New order {order.reference} — {_ugx(int(order.total))}",
        html=email_theme.shell(
            heading=f"New order — {_ugx(int(order.total))}",
            intro=f"<b>{order.customer_name}</b> &middot; {order.phone}"
            + (f" &middot; {order.email}" if order.email else "")
            + f"<br />Order <b>{order.reference}</b> &middot; deliver to {where}",
            body_html=body,
            show_phones=False,
        ),
    )

    if order.email:
        ok &= await send_email(
            to=order.email,
            subject=f"Your Online Tech Uganda order {order.reference}",
            html=customer_html,
        )
    return ok


def _code_html(*, heading: str, intro: str, code: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#282363">{heading}</h2>
      <p style="color:#444">{intro}</p>
      <p style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#f15a29;
                background:#f6f6fb;border-radius:10px;padding:16px;text-align:center;margin:20px 0">
        {code}
      </p>
      <p style="color:#888;font-size:13px">This code expires in 20 minutes. If you didn't request it, you can ignore this email.</p>
      <p style="color:#888;font-size:13px">— Online Tech Uganda</p>
    </div>
    """


async def send_verification_code(*, to: str, name: str, code: str) -> bool:
    """Email a new user their account-verification code."""
    html = _code_html(
        heading=f"Welcome, {name}!",
        intro="Confirm your email address to secure your Online Tech Uganda account. Enter this code on the site:",
        code=code,
    )
    return await send_email(to=to, subject="Verify your email — Online Tech Uganda", html=html)


async def send_login_otp(*, to: str, name: str, code: str) -> bool:
    """Email a login one-time passcode (2FA)."""
    html = _code_html(
        heading="Your login code",
        intro=f"Hi {name}, use this one-time code to finish signing in:",
        code=code,
    )
    return await send_email(to=to, subject="Your login code — Online Tech Uganda", html=html)


async def send_unlock_code(
    *, to: str, name: str, course_title: str, code: str, price: int = 0
) -> bool:
    """Email a learner their course unlock code as soon as they register."""
    price_line = f"<p style='color:#444'>Course fee: <b>{_ugx(price)}</b></p>" if price else ""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#282363">Your unlock code for {course_title}</h2>
      <p style="color:#444">Hi {name}, thank you for enrolling! Here is your personal unlock code:</p>
      <p style="font-size:30px;font-weight:bold;letter-spacing:6px;color:#f15a29;
                background:#f6f6fb;border-radius:10px;padding:16px;text-align:center;margin:18px 0">
        {code}
      </p>
      {price_line}
      <ol style="color:#444;font-size:14px;line-height:1.6">
        <li>Pay the course fee via <b>Mobile Money</b> and send us your confirmation on WhatsApp.</li>
        <li>Once we confirm payment we activate this code.</li>
        <li>Enter it on the course page to unlock all lessons.</li>
      </ol>
      <p style="color:#888;font-size:13px">Keep this code safe — it's tied to your enrolment. — Online Tech Uganda</p>
    </div>
    """
    return await send_email(to=to, subject=f"Your unlock code for {course_title}", html=html)


async def send_enrollment_alert(
    *, course_title: str, code: str, name: str, phone: str, email: str = "", price: int = 0
) -> bool:
    """Notify the OWNER (not the learner) of a new enrolment, with the unlock code
    to send the learner once their Mobile Money payment is confirmed."""
    price_line = f"<p><b>Course fee:</b> {_ugx(price)}</p>" if price else ""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#282363">New course enrolment</h2>
      <p style="color:#444">Someone registered for <b>{course_title}</b>. Send them this unlock code once you
      confirm their Mobile Money payment:</p>
      <p style="font-size:30px;font-weight:bold;letter-spacing:6px;color:#f15a29;
                background:#f6f6fb;border-radius:10px;padding:16px;text-align:center;margin:18px 0">
        {code}
      </p>
      <p><b>Name:</b> {name}</p>
      <p><b>Phone:</b> {phone}</p>
      <p><b>Email:</b> {email or "—"}</p>
      {price_line}
      <p style="color:#888;font-size:13px">Once you confirm their Mobile Money payment, just send them this
      code — it unlocks the course immediately. — Online Tech Uganda</p>
    </div>
    """
    return await send_email(
        to=settings.contact_inbox,
        subject=f"New enrolment: {course_title} — code {code}",
        html=html,
        reply_to=email or None,
    )


async def send_code_activated(*, to: str, course_title: str, code: str) -> bool:
    """Tell a learner their unlock code is now active (payment confirmed)."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#282363">Your course is unlocked! 🎉</h2>
      <p style="color:#444">Payment confirmed for <b>{course_title}</b>. Your code is now active:</p>
      <p style="font-size:30px;font-weight:bold;letter-spacing:6px;color:#00a651;
                background:#f6f6fb;border-radius:10px;padding:16px;text-align:center;margin:18px 0">
        {code}
      </p>
      <p style="color:#444;font-size:14px">Enter it on the course page to open all lessons. Happy learning!</p>
      <p style="color:#888;font-size:13px">— Online Tech Uganda</p>
    </div>
    """
    return await send_email(to=to, subject=f"{course_title} unlocked — start learning", html=html)


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
