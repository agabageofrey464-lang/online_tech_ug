from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderSummary
from app.services import orders as orders_service
from app.services.email import send_order_confirmation

router = APIRouter()


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
