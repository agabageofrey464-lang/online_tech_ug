import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.core import ratelimit
from app.core.config import settings
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderSummary, OrderUpdate
from app.services import orders as orders_service
from app.services.email import send_order_confirmation
from app.services import delivery, notify, push, whatsapp

logger = logging.getLogger(__name__)

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderOut:
    try:
        order = orders_service.create_order(db, payload)
    except orders_service.OrderError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    await send_order_confirmation(order, db)
    # An inbox is read when someone remembers to read it; a WhatsApp message
    # gets acted on. Never let a failed notification fail the order.
    await whatsapp.notify_owner(whatsapp.order_message(order))
    await push.notify_owner(
        db,
        f"🛒 New order {order.reference}",
        f"UGX {int(order.total):,} · {order.customer_name} · {order.phone}",
        "/orders",
    )
    return order


@router.get("/delivery-quote")
async def delivery_quote(lat: float, lng: float) -> dict:
    """Public: road distance from the shop to a point, and the transport fee for it."""
    if not delivery.in_range(lat, lng):
        raise HTTPException(status_code=400, detail="That place is outside the area we deliver to.")
    km, by_road = await delivery.road_km(lat, lng)
    km = round(km, 1)
    return {
        "km": km,
        "fee": orders_service._fee_for_km(km),
        # False when the routing service was unreachable and the distance is
        # the straight line with an allowance for the road.
        "by_road": by_road,
    }


@router.get("", response_model=list[OrderSummary], dependencies=[Depends(require_admin)])
def list_orders(db: Session = Depends(get_db)) -> list[OrderSummary]:
    """Admin: recent orders, each tagged with a fraud/risk level."""
    orders = orders_service.list_orders(db)
    risk = orders_service.assess_orders(orders)
    for o in orders:
        info = risk.get(o.id, {})
        o.risk_level = info.get("level", "none")
        o.risk_reasons = info.get("reasons", [])
        # The admin replies to customers straight from the list, and a reply
        # that names what they bought needs the items here, not a second fetch.
        o.items_summary = ", ".join(
            f"{i.quantity} x {i.name}" for i in o.items
        )
    return orders


@router.get("/report", dependencies=[Depends(require_admin)])
def sales_report(days: int = 14, db: Session = Depends(get_db)) -> dict:
    """Admin: aggregated sales figures for the report dashboard."""
    return orders_service.sales_report(db, days=days)


TOO_MANY = "Too many attempts. Please wait a few minutes and try again."


@router.get("/{reference}", response_model=OrderOut)
def get_order(
    reference: str,
    request: Request,
    x_admin_key: str = Header(default=""),
    db: Session = Depends(get_db),
) -> OrderOut:
    """Public: a customer tracks an order by the reference we sent them.

    A reference gets forwarded, screenshotted and read out over the phone, so
    it opens the order's progress and what was bought — not who bought it. The
    tracker greets by first name; the phone, email, address and notes stay
    with the admin, who sends the key.

    Guessing still has to be slow. A customer looks up one order a few times;
    a script trying references gets them wrong, and it is the wrong ones that
    are counted against the address it connects from.
    """
    is_admin = bool(settings.admin_api_key) and x_admin_key == settings.admin_api_key
    misses = f"order-miss:{ratelimit.peer_ip(request)}"
    if not is_admin:
        if ratelimit.exceeded(misses, limit=30, window_seconds=600):
            raise HTTPException(status_code=429, detail=TOO_MANY)
        if not ratelimit.allow(
            f"order-lookup:{ratelimit.client_ip(request)}", limit=40, window_seconds=300
        ):
            raise HTTPException(status_code=429, detail=TOO_MANY)

    order = orders_service.get_order(db, reference)
    if not order:
        if not is_admin:
            ratelimit.allow(misses, limit=30, window_seconds=600)
        raise HTTPException(status_code=404, detail="Order not found")
    if is_admin:
        return order
    return OrderOut.model_validate(order).model_copy(
        update={
            "customer_name": order.customer_name.split(" ")[0],
            "phone": "",
            "email": "",
            "delivery_address": "",
            "notes": "",
            "pesapal_tracking_id": "",
        }
    )


@router.patch("/{reference}", response_model=OrderOut, dependencies=[Depends(require_admin)])
async def update_order(
    reference: str, payload: OrderUpdate, db: Session = Depends(get_db)
) -> OrderOut:
    """Admin: update an order's status / payment status (e.g. mark delivered/paid).

    A customer who has paid and heard nothing assumes the worst, so each step
    forward is emailed to them with our phone numbers to call and confirm.
    """
    before = orders_service.get_order(db, reference)
    was = before.status if before else None

    order = orders_service.update_order(db, reference, payload.status, payload.payment_status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.status and payload.status != was:
        await notify.order_status_changed(order, payload.status, db)

    return order


@router.delete("/{reference}", dependencies=[Depends(require_admin)])
def delete_order(reference: str, db: Session = Depends(get_db)) -> dict:
    """Admin: delete an order permanently, with its line items.

    There was no way to remove one at all, so test orders and duplicates sat in
    the list for good and made the counts on the dashboard wrong.

    This is a real delete, not a status change. Cancelling an order keeps the
    record and the revenue; this removes both, which is what is wanted for a
    test order and almost never what is wanted for a real one. The admin says
    so on the button, and the deleted order is returned so the action can be
    reported precisely rather than as "done".
    """
    removed = orders_service.delete_order(db, reference)
    if removed is None:
        raise HTTPException(status_code=404, detail="Order not found")
    logger.info("Order deleted: %s", removed)
    return {"ok": True, "deleted": removed}
