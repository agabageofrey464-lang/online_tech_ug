from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderSummary, OrderUpdate
from app.services import orders as orders_service
from app.services.email import send_order_confirmation

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
    return order


@router.get("", response_model=list[OrderSummary])
def list_orders(db: Session = Depends(get_db)) -> list[OrderSummary]:
    """Admin: recent orders."""
    return orders_service.list_orders(db)


@router.get("/{reference}", response_model=OrderOut)
def get_order(reference: str, db: Session = Depends(get_db)) -> OrderOut:
    order = orders_service.get_order(db, reference)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{reference}", response_model=OrderOut, dependencies=[Depends(require_admin)])
def update_order(reference: str, payload: OrderUpdate, db: Session = Depends(get_db)) -> OrderOut:
    """Admin: update an order's status / payment status (e.g. mark delivered/paid)."""
    order = orders_service.update_order(db, reference, payload.status, payload.payment_status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
