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


async def send_verification_code(*, to: str, name: str, code: str) -> bool:
    """Email a new user their account-verification code."""
    body = (
        email_theme.text(f"Hello {name},")
        + email_theme.text(
            "Confirm your email address to secure your Online Tech Uganda account. "
            "Enter this code on the site:"
        )
        + email_theme.code_block(code)
        + email_theme.text(
            '<span style="font-size:12.5px;color:#6e6e6e">This code expires in 20 minutes. '
            "If you didn&rsquo;t request it, you can ignore this email.</span>"
        )
    )
    return await send_email(
        to=to,
        subject="Verify your email — Online Tech Uganda",
        html=email_theme.shell(heading=f"Welcome, {name}", body_html=body, show_phones=False),
    )


async def send_login_otp(*, to: str, name: str, code: str) -> bool:
    """Email a login one-time passcode (2FA)."""
    body = (
        email_theme.text(f"Hi {name}, use this one-time code to finish signing in:")
        + email_theme.code_block(code)
        + email_theme.text(
            '<span style="font-size:12.5px;color:#6e6e6e">This code expires in 20 minutes. '
            "If you didn&rsquo;t try to sign in, you can ignore this email &mdash; "
            "but do tell us, because someone has your address.</span>"
        )
    )
    return await send_email(
        to=to,
        subject="Your login code — Online Tech Uganda",
        html=email_theme.shell(heading="Your login code", body_html=body, show_phones=False),
    )


async def send_password_reset_code(*, to: str, name: str, code: str) -> bool:
    """Email the code that lets someone choose a new password."""
    body = (
        email_theme.text(f"Hi {name}, use this code to choose a new password:")
        + email_theme.code_block(code)
        + email_theme.text(
            '<span style="font-size:12.5px;color:#6e6e6e">This code expires in 20 minutes and works once. '
            "If you didn&rsquo;t ask to reset your password, ignore this email &mdash; "
            "your password has not been changed.</span>"
        )
    )
    return await send_email(
        to=to,
        subject="Reset your password — Online Tech Uganda",
        html=email_theme.shell(heading="Reset your password", body_html=body, show_phones=False),
    )


async def send_unlock_code(
    *, to: str, name: str, course_title: str, code: str, price: int = 0
) -> bool:
    """Email a learner their course unlock code as soon as they register."""
    body = (
        email_theme.text(f"Hi {name}, thank you for enrolling. Here is your personal unlock code:")
        + email_theme.code_block(code)
        + (
            email_theme.panel("Course fee", f"<b>{_ugx(price)}</b>")
            if price
            else ""
        )
        + email_theme.steps(
            [
                "Pay the course fee by <b>Mobile Money</b> and send us the confirmation on WhatsApp.",
                "We confirm your payment and activate this code.",
                "Enter it on the course page to unlock your lessons.",
            ]
        )
        + email_theme.button(
            f"Open {course_title}", f"{settings.site_url.rstrip('/')}/learn"
        )
        + email_theme.text(
            '<span style="font-size:12.5px;color:#6e6e6e">Keep this code safe &mdash; '
            "it is tied to your enrolment and your device.</span>"
        )
    )
    return await send_email(
        to=to,
        subject=f"Your unlock code for {course_title}",
        html=email_theme.shell(heading=f"Your code for {course_title}", body_html=body),
    )


async def send_enrollment_alert(
    *, course_title: str, code: str, name: str, phone: str, email: str = "", price: int = 0
) -> bool:
    """Notify the OWNER (not the learner) of a new enrolment, with the unlock code
    to send the learner once their Mobile Money payment is confirmed."""
    pairs = [("Name", name), ("Phone", phone), ("Email", email or "—"), ("Course", course_title)]
    if price:
        pairs.append(("Course fee", _ugx(price)))

    body = (
        email_theme.text(
            f"Someone registered for <b>{course_title}</b>. Send them this code once you have "
            "confirmed their Mobile Money payment:"
        )
        + email_theme.code_block(code)
        + email_theme.details(pairs)
        + email_theme.panel(
            "Next step",
            "Approve the enrolment in <b>Admin &rsaquo; Enrollments</b> and the code is "
            "emailed to them automatically.",
        )
    )
    return await send_email(
        to=settings.contact_inbox,
        subject=f"New enrolment: {course_title} — code {code}",
        html=email_theme.shell(
            heading="New course enrolment", body_html=body, show_phones=False
        ),
        reply_to=email or None,
    )


async def send_registration_received(
    *,
    to: str,
    name: str,
    course_title: str,
    reference: str,
    course_slug: str = "",
    price: int = 0,
) -> bool:
    """Confirm to the LEARNER that we have their registration.

    Sent the moment the form is submitted. Someone who fills in a form and
    gets nothing back assumes it failed, which is why registration used to
    end in a WhatsApp message — this is that receipt, in writing.
    """
    first = (name or "there").split(" ")[0]
    pairs = [("Reference", reference), ("Course", course_title), ("Name", name or "—")]
    if price:
        pairs.append(("Course fee", _ugx(price)))

    body = (
        email_theme.text(f"Hello {first},")
        + email_theme.text(
            f"We have your registration for <b>{course_title}</b>. Your place is held — "
            "nothing more is needed from you right now."
        )
        + email_theme.details(pairs)
        + email_theme.panel(
            "How to pay",
            f"Mobile Money to <b>{settings.company_phone}</b> or "
            f"<b>{settings.company_phone_alt}</b>, in the name of Online Tech Uganda. "
            "You can also pay at our Kampala office. Quote your reference above.",
        )
        + email_theme.steps([
            "Pay the course fee by Mobile Money, or come to the office.",
            "We confirm your payment — usually the same working day.",
            "You get an email with your unlock code and your class timetable.",
            "Enter the code on the course page and your lessons open.",
        ])
        + email_theme.text(
            "Keep this email — your reference is how we find you if you call or visit."
        )
        + email_theme.button(
            "View your course",
            f"{settings.site_url.rstrip('/')}/learn/{course_slug}" if course_slug
            else f"{settings.site_url.rstrip('/')}/learn",
        )
    )
    return await send_email(
        to=to,
        subject=f"Registration received — {course_title} ({reference})",
        html=email_theme.shell(heading="Registration received", body_html=body),
        reply_to=settings.contact_inbox,
    )


async def send_code_activated(*, to: str, course_title: str, code: str) -> bool:
    """Tell a learner their unlock code is now active (payment confirmed)."""
    body = (
        email_theme.text(
            f"Payment confirmed for <b>{course_title}</b>. Your code is now active:"
        )
        + email_theme.code_block(code, colour="#00a651")
        + email_theme.text("Enter it on the course page to open your lessons. Happy learning.")
        + email_theme.button("Start learning", f"{settings.site_url.rstrip('/')}/learn")
    )
    return await send_email(
        to=to,
        subject=f"{course_title} unlocked — start learning",
        html=email_theme.shell(heading="Your course is unlocked", body_html=body),
    )


async def send_request_received(
    *, to: str, name: str, subject: str, reference: str, summary: str = ""
) -> bool:
    """Confirm to the CLIENT that a request reached us.

    Every request form on the site ends here. A form that answers with
    nothing teaches people to chase us on WhatsApp instead, which is the
    habit this replaces.
    """
    first = (name or "there").split(" ")[0]
    pairs = [("Reference", reference), ("Request", subject or "General enquiry")]

    body = (
        email_theme.text(f"Hello {first},")
        + email_theme.text(
            "Thank you — we have your request and it is with our team. "
            "Nothing more is needed from you right now."
        )
        + email_theme.details(pairs)
        + (email_theme.panel("What you sent us", summary) if summary else "")
        + email_theme.steps([
            "We read your request and check what it needs.",
            "We come back to you with a written quote, scope and timeline.",
            "You approve it, and we start.",
        ])
        + email_theme.text(
            "Most requests are answered within one working day. "
            "Quote your reference if you call us."
        )
        + email_theme.button("See our work", f"{settings.site_url.rstrip('/')}/portfolio")
    )
    return await send_email(
        to=to,
        subject=f"We have your request — {reference}",
        html=email_theme.shell(heading="Request received", body_html=body),
        reply_to=settings.contact_inbox,
    )


async def send_contact_notification(
    *, name: str, phone: str, email: str, subject: str, message: str
) -> bool:
    """Tell the owner someone has written in, with everything needed to reply."""
    wa = "".join(ch for ch in (phone or "") if ch.isdigit())
    if wa.startswith("0"):
        wa = "256" + wa[1:]

    contact = [
        ("Name", name),
        ("Phone", f'<a href="tel:{phone}" style="color:#0e7490;text-decoration:none">{phone}</a>'),
        (
            "Email",
            f'<a href="mailto:{email}" style="color:#0e7490;text-decoration:none">{email}</a>'
            if email
            else "—",
        ),
        ("About", subject or "—"),
    ]

    body = (
        email_theme.details(contact)
        + email_theme.panel("Their message", message.replace("\n", "<br />"))
        + (
            email_theme.button("Reply on WhatsApp", f"https://wa.me/{wa}", colour="#25D366")
            if wa
            else ""
        )
    )
    return await send_email(
        to=settings.contact_inbox,
        subject=f"New inquiry: {subject or 'Website contact'}",
        html=email_theme.shell(
            heading="Someone has written in",
            intro="Reply to this email and it goes straight to them.",
            body_html=body,
            show_phones=False,
        ),
        reply_to=email or None,
    )
