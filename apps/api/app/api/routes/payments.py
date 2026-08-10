import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.payment import PaymentIn, StatusIn
from app.services import flutterwave
from app.services import orders as orders_service
from app.services import payments as payments_service
from app.services import unlock_codes
from app.services.courses import get_course
from app.services.email import send_code_activated

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
    """Public: is online payment (Flutterwave) switched on? Lets the storefront
    show or hide the 'Pay online' button."""
    return {"enabled": flutterwave.configured()}


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
