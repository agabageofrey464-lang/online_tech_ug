from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderSummary, OrderUpdate
from app.services import orders as orders_service
from app.services.email import send_order_confirmation
from app.services import notify, whatsapp

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
    await send_order_confirmation(order)
    # An inbox is read when someone remembers to read it; a WhatsApp message
    # gets acted on. Never let a failed notification fail the order.
    await whatsapp.notify_owner(whatsapp.order_message(order))
    return order


@router.get("", response_model=list[OrderSummary])
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


@router.get("/{reference}", response_model=OrderOut)
def get_order(reference: str, db: Session = Depends(get_db)) -> OrderOut:
    order = orders_service.get_order(db, reference)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


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
        await notify.order_status_changed(order, payload.status)

    return order
