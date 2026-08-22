import json
import logging
import secrets

from fastapi import APIRouter, Body, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order, PaymentTransaction
from app.schemas.payment import PaymentIn, StatusIn
from app.services import flutterwave, pesapal
from app.services import orders as orders_service
from app.services import payments as payments_service
from app.services import unlock_codes
from app.services.courses import get_course
from app.services.email import send_code_activated, send_order_confirmation

logger = logging.getLogger("onlinetech.payments")

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class OnlineInitIn(BaseModel):
    reference: str


@router.post("/online/init")
async def online_init(payload: OnlineInitIn, db: Session = Depends(get_db)) -> dict:
    """Start an online payment (Flutterwave) for an existing order. Returns a
    checkout link to redirect the customer to (MTN, Airtel or card)."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    order = orders_service.get_order(db, payload.reference)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    tx_ref = f"{order.reference}-{secrets.token_hex(3)}"
    redirect_url = f"{settings.site_url}/checkout/success?ref={order.reference}"
    try:
        link = await flutterwave.create_payment(
            amount=int(order.total), email=order.email, phone=order.phone,
            name=order.customer_name, tx_ref=tx_ref, redirect_url=redirect_url,
            meta={"reference": order.reference},
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't start payment: {exc}") from None
    return {"link": link}


@router.get("/online/verify")
async def online_verify(transaction_id: str, db: Session = Depends(get_db)) -> dict:
    """Verify a Flutterwave transaction on return and mark the order paid."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    try:
        data = await flutterwave.verify(transaction_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't verify payment: {exc}") from None
    status = str(data.get("status", "")).lower()
    reference = (data.get("meta") or {}).get("reference") or str(data.get("tx_ref", "")).split("-")[0]
    if status == "successful" and reference:
        orders_service.update_order(db, reference, "confirmed", "paid")
    return {"status": status or "failed", "reference": reference}


@router.get("/online/status")
def online_status() -> dict:
    """Public: is online payment switched on? Lets the storefront show/hide the
    'Pay online' button. Enabled if EITHER provider is configured."""
    return {
        "enabled": pesapal.configured() or flutterwave.configured(),
        "pesapal": pesapal.configured(),
        "flutterwave": flutterwave.configured(),
    }


# ─────────────────────────────── Pesapal ────────────────────────────────
# An order becomes paid ONLY when Pesapal's GetTransactionStatus reports
# "Completed" (called from the IPN webhook and the return check) — never on
# redirect back to the site.

class PesapalInitIn(BaseModel):
    reference: str  # an existing order reference


# Pesapal status -> (payment_status, order_status) our system uses. Order status
# only advances to "processing" on a genuine, verified completed payment.
_PAY_MAP = {
    "completed": ("paid", "processing"),
    "failed": ("failed", None),
    "invalid": ("failed", None),
    "reversed": ("reversed", None),
    "cancelled": ("cancelled", None),
    "pending": (None, None),
}


async def _confirm_from_pesapal(db: Session, order_tracking_id: str, merchant_ref: str) -> str:
    """Authoritatively verify a Pesapal transaction and update the order — safely
    and idempotently. Marks paid ONLY when Pesapal reports Completed AND the
    amount/currency/reference match the order. Returns the normalised status."""
    if not order_tracking_id:
        return "pending"

    # Find the order (by merchant reference, else by the stored tracking id).
    order: Order | None = None
    if merchant_ref:
        order = orders_service.get_order(db, merchant_ref)
    if order is None:
        order = db.execute(
            select(Order).where(Order.pesapal_tracking_id == order_tracking_id)
        ).scalar_one_or_none()
    if order is None:
        logger.warning("Pesapal confirm: no order for ref=%s tracking=%s", merchant_ref, order_tracking_id)
        return "not_found"

    verified = await pesapal.verify_transaction(order_tracking_id)
    status = verified["status"]

    # ── Security checks — reference / currency / amount must match the order ──
    if verified["merchant_reference"] and verified["merchant_reference"] != order.reference:
        logger.warning("Pesapal ref mismatch: order=%s pesapal=%s", order.reference, verified["merchant_reference"])
        return "mismatch"
    if status == "completed":
        if verified["currency"] and verified["currency"] != (order.currency or "UGX"):
            logger.warning("Pesapal currency mismatch on %s: %s", order.reference, verified["currency"])
            return "mismatch"
        # Allow a 1-unit rounding tolerance; never accept an under-payment.
        if verified["amount"] + 1 < float(order.total):
            logger.warning("Pesapal underpaid %s: paid %s of %s", order.reference, verified["amount"], order.total)
            status = "failed"

    # ── Idempotent audit record (one row per tracking id) ──
    txn = db.execute(
        select(PaymentTransaction).where(PaymentTransaction.tracking_id == order_tracking_id)
    ).scalar_one_or_none()
    already_paid = order.payment_status == "paid"
    if txn is None:
        txn = PaymentTransaction(order_id=order.id, tracking_id=order_tracking_id)
        db.add(txn)
    txn.merchant_reference = order.reference
    txn.amount = int(verified["amount"] or order.total)
    txn.currency = verified["currency"] or order.currency or "UGX"
    txn.payment_method = verified["payment_method"] or ""
    txn.payment_status = status.upper()
    txn.pesapal_response = json.dumps(verified.get("raw") or {})[:4000]
    if not order.pesapal_tracking_id:
        order.pesapal_tracking_id = order_tracking_id

    # ── Apply to the order (idempotent: don't reprocess an already-paid order) ──
    pay, order_status = _PAY_MAP.get(status, (None, None))
    if pay and not (already_paid and pay == "paid"):
        order.payment_status = pay
        if order_status:
            order.status = order_status
    db.commit()

    # Notify only on the transition into paid (not on repeat IPNs).
    if status == "completed" and not already_paid:
        try:
            db.refresh(order)
            await send_order_confirmation(order)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Order confirmation email failed for %s: %s", order.reference, exc)

    return status


@router.post("/pesapal/init")
async def pesapal_init(payload: PesapalInitIn, db: Session = Depends(get_db)) -> dict:
    """Start a Pesapal payment for an existing order. Returns the checkout URL to
    redirect the customer to. The order stays 'pending' until Pesapal confirms."""
    if not pesapal.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    order = orders_service.get_order(db, payload.reference)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    callback_url = f"{settings.site_url}/checkout/success?ref={order.reference}"
    currency = order.currency or "UGX"
    try:
        res = await pesapal.submit_order(
            merchant_ref=order.reference, amount=int(order.total), currency=currency,
            description=f"Order {order.reference} — Online Tech Uganda",
            callback_url=callback_url, email=order.email, phone=order.phone, name=order.customer_name,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't start payment: {exc}") from None
    # Link the order to this Pesapal transaction (order stays PENDING until verified).
    order.pesapal_tracking_id = res["order_tracking_id"]
    order.pesapal_merchant_reference = order.reference
    order.payment_method = "pesapal"
    db.commit()
    return {"redirect_url": res["redirect_url"], "order_tracking_id": res["order_tracking_id"]}


async def _handle_ipn(db: Session, tracking: str, merchant_ref: str, notif_type: str) -> dict:
    """Shared IPN handling. Confirms with Pesapal, then returns Pesapal's expected
    acknowledgement payload."""
    if tracking:
        try:
            await _confirm_from_pesapal(db, tracking, merchant_ref)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Pesapal IPN confirm failed for %s: %s", merchant_ref, exc)
    # Pesapal expects this JSON back so it stops retrying.
    return {
        "orderNotificationType": notif_type,
        "orderTrackingId": tracking,
        "orderMerchantReference": merchant_ref,
        "status": 200,
    }


@router.get("/pesapal/ipn")
async def pesapal_ipn_get(
    order_tracking_id: str = Query(default="", alias="OrderTrackingId"),
    merchant_ref: str = Query(default="", alias="OrderMerchantReference"),
    notif_type: str = Query(default="IPNCHANGE", alias="OrderNotificationType"),
    db: Session = Depends(get_db),
) -> dict:
    """Pesapal IPN webhook (GET). Server-to-server — the trustworthy signal."""
    return await _handle_ipn(db, order_tracking_id, merchant_ref, notif_type)


@router.post("/pesapal/ipn")
async def pesapal_ipn_post(payload: dict = Body(default={}), db: Session = Depends(get_db)) -> dict:
    """Pesapal IPN webhook (POST) — same handling as GET."""
    tracking = str(payload.get("OrderTrackingId", ""))
    merchant_ref = str(payload.get("OrderMerchantReference", ""))
    notif_type = str(payload.get("OrderNotificationType", "IPNCHANGE"))
    return await _handle_ipn(db, tracking, merchant_ref, notif_type)


@router.get("/pesapal/status")
async def pesapal_status(
    order_tracking_id: str = Query(...),
    reference: str = Query(default=""),
    db: Session = Depends(get_db),
) -> dict:
    """Called by the return page to reflect the real status (and mark paid if the
    IPN hasn't arrived yet). Still authoritative — it queries Pesapal."""
    if not pesapal.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    try:
        status = await _confirm_from_pesapal(db, order_tracking_id, reference)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't check payment: {exc}") from None
    return {"status": status, "reference": reference}


class CourseInitIn(BaseModel):
    course_slug: str
    name: str
    email: str
    phone: str = ""


@router.post("/course/init")
async def course_init(payload: CourseInitIn, db: Session = Depends(get_db)) -> dict:
    """Start an online payment for a COURSE. Pre-creates a pending unlock code and
    returns a Flutterwave checkout link; the code is activated once payment clears."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    course = get_course(db, payload.course_slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    price = int(course.get("price_ugx") or 0)
    if price <= 0:
        raise HTTPException(status_code=400, detail="This course isn't available for online payment.")

    # Pre-create the learner's code in a PENDING (revoked) state; verify activates it.
    try:
        created = unlock_codes.generate_code(
            db,
            payload.course_slug,
            note=f"{payload.name} · {payload.phone} · paid online",
            pending=True,
            email=payload.email,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    tx_ref = f"crs-{secrets.token_hex(5)}"
    redirect_url = f"{settings.site_url}/learn/{payload.course_slug}/success"
    meta = {
        "kind": "course",
        "course_slug": payload.course_slug,
        "course_title": course.get("title", payload.course_slug),
        "code_id": created["id"],
        "unlock_code": created["code"],
        "email": payload.email,
        "name": payload.name,
    }
    try:
        link = await flutterwave.create_payment(
            amount=price, email=payload.email, phone=payload.phone,
            name=payload.name, tx_ref=tx_ref, redirect_url=redirect_url, meta=meta,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't start payment: {exc}") from None
    return {"link": link}


@router.get("/course/verify")
async def course_verify(transaction_id: str, db: Session = Depends(get_db)) -> dict:
    """Verify a course payment on return: activate the learner's unlock code, email
    it to them, and return it so the success page can show it immediately."""
    if not flutterwave.configured():
        raise HTTPException(status_code=503, detail="Online payments are not enabled yet.")
    try:
        data = await flutterwave.verify(transaction_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Couldn't verify payment: {exc}") from None

    status = str(data.get("status", "")).lower()
    meta = data.get("meta") or {}
    course_slug = meta.get("course_slug", "")
    course_title = meta.get("course_title", course_slug)
    code = meta.get("unlock_code", "")
    code_id = meta.get("code_id")
    email = meta.get("email", "")

    if status != "successful":
        return {"status": status or "failed", "code": "", "course_slug": course_slug}

    # Guard against under-payment (wrong/edited amount or currency).
    course = get_course(db, course_slug) if course_slug else None
    price = int(course.get("price_ugx") or 0) if course else 0
    paid = float(data.get("amount") or 0)
    currency = str(data.get("currency", "")).upper()
    if price and (currency != "UGX" or paid + 1 < price):
        return {"status": "underpaid", "code": "", "course_slug": course_slug}

    # Activate the pending code and email it to the learner (idempotent).
    if code_id:
        try:
            unlock_codes.set_revoked(db, int(code_id), False)
        except (TypeError, ValueError):
            pass
    if email and code:
        try:
            await send_code_activated(to=email, course_title=course_title, code=code)
        except Exception:  # noqa: BLE001
            pass  # payment already succeeded — don't fail the flow on email trouble
    return {"status": "successful", "code": code, "course_slug": course_slug, "course_title": course_title}


@router.post("", status_code=201)
def report_payment(payload: PaymentIn, db: Session = Depends(get_db)) -> dict:
    """Public: a payer records a Mobile Money payment they've made."""
    p = payments_service.create(db, payload.model_dump())
    return {"id": p.id, "ok": True}


@router.get("/admin", dependencies=[Depends(require_admin)])
def admin_payments(db: Session = Depends(get_db)) -> dict:
    return payments_service.list_payments(db)


@router.patch("/admin/{payment_id}", dependencies=[Depends(require_admin)])
def update_payment(payment_id: int, payload: StatusIn, db: Session = Depends(get_db)) -> dict:
    if not payments_service.set_status(db, payment_id, payload.status):
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"id": payment_id, "status": payload.status}
