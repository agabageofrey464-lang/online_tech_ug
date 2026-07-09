"""Order creation & lookup.

Prices are ALWAYS recomputed on the server from the catalog — the client-sent
cart is treated as a request, never as a source of truth for money.
"""

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate
from app.services.catalog import get_product

# Free delivery above this subtotal (UGX) — within the Kampala metro
FREE_DELIVERY_THRESHOLD = 3_000_000

# Distance-based transport: road-km from the shop (Liberty Tower, Kampala Road).
# Keep in sync with apps/web/src/lib/delivery.ts
TOWN_DISTANCE_KM = {
    "kampala": 0, "nansana": 12, "kira": 14, "wakiso": 20, "mukono": 22,
    "entebbe": 37, "lugazi": 45, "mityana": 60, "njeru": 75, "jinja": 80,
    "iganga": 115, "masaka": 130, "mubende": 150, "busia": 195, "hoima": 200,
    "tororo": 220, "mbale": 230, "mbarara": 270, "soroti": 290,
    "fort portal": 300, "gulu": 330, "lira": 340, "kasese": 350,
    "kabale": 410, "arua": 480,
}


class OrderError(Exception):
    """Raised when an order cannot be created (e.g. unknown / out-of-stock item)."""


def _fee_for_km(km: int) -> int:
    if km <= 25:
        return 10_000
    if km <= 80:
        return 20_000
    if km <= 200:
        return 35_000
    if km <= 350:
        return 55_000
    return 75_000


def compute_delivery_fee(town: str, subtotal: int) -> int:
    km = TOWN_DISTANCE_KM.get(town.strip().lower(), 150)  # unknown → mid-distance
    if subtotal >= FREE_DELIVERY_THRESHOLD and km <= 25:
        return 0
    return _fee_for_km(km)


def _generate_reference() -> str:
    return "OTU-" + secrets.token_hex(3).upper()  # e.g. OTU-9F2A1C


def create_order(db: Session, payload: OrderCreate) -> Order:
    line_items: list[OrderItem] = []
    subtotal = 0

    for item in payload.items:
        product = get_product(db, item.slug)
        if not product:
            raise OrderError(f"Product not found: {item.slug}")
        if not product.get("in_stock", True):
            raise OrderError(f"Out of stock: {product['name']}")
        unit_price = int(product["price_ugx"])
        line_total = unit_price * item.quantity
        subtotal += line_total
        line_items.append(
            OrderItem(
                product_slug=product["slug"],
                name=product["name"],
                unit_price=unit_price,
                quantity=item.quantity,
                line_total=line_total,
            )
        )

    delivery_fee = compute_delivery_fee(payload.delivery_town, subtotal)
    total = subtotal + delivery_fee

    # MoMo flows start as "pending" payment; COD is collected on delivery.
    payment_status = "pending" if payload.payment_method.value != "cash_on_delivery" else "unpaid"

    order = Order(
        reference=_generate_reference(),
        customer_name=payload.customer_name,
        phone=payload.phone,
        email=str(payload.email or ""),
        delivery_town=payload.delivery_town,
        delivery_address=payload.delivery_address,
        notes=payload.notes,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        payment_method=payload.payment_method.value,
        payment_status=payment_status,
        status="pending",
        items=line_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, reference: str) -> Order | None:
    return db.execute(
        select(Order).where(Order.reference == reference)
    ).scalar_one_or_none()


def list_orders(db: Session, limit: int = 100) -> list[Order]:
    return list(
        db.execute(select(Order).order_by(Order.created_at.desc()).limit(limit)).scalars().all()
    )


_ALLOWED_STATUS = {"pending", "confirmed", "processing", "shipped", "delivered", "cancelled"}
_ALLOWED_PAYMENT = {"pending", "unpaid", "paid", "refunded"}


def update_order(
    db: Session, reference: str, status: str | None = None, payment_status: str | None = None
) -> Order | None:
    """Admin: update fulfilment/payment status. Returns the order, or None if missing."""
    order = get_order(db, reference)
    if not order:
        return None
    if status and status in _ALLOWED_STATUS:
        order.status = status
    if payment_status and payment_status in _ALLOWED_PAYMENT:
        order.payment_status = payment_status
    db.commit()
    db.refresh(order)
    return order
