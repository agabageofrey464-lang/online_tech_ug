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
