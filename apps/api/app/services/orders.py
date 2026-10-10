"""Order creation & lookup.

Prices are ALWAYS recomputed on the server from the catalog — the client-sent
cart is treated as a request, never as a source of truth for money.
"""

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order, OrderItem
from app.models.vendor_product import VendorProduct
from app.schemas.order import OrderCreate
from app.services import catalog, coupons, delivery
from app.services.catalog import get_product

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


def commission_rate_for(line_total: int) -> float:
    """What we take from a vendor's sale.

    Nothing. Vendors pay a flat monthly, half-year or yearly subscription and keep
    the whole sale price, which is what the sell page promises them. The tiered
    5–10% this used to return is gone; the column stays on order_items so past
    orders still read correctly.
    """
    return settings.platform_commission_rate


def commission_for(line_total: int) -> int:
    return round(line_total * commission_rate_for(line_total))


# Transport is worked out from the road distance: a base charge that covers
# the first ten kilometres, then a rate per kilometre after, rounded to the
# nearest thousand shillings. The storefront shows the customer the same sum
# (apps/web/src/lib/delivery.ts) — change the figures in both places together.
DELIVERY_BASE = 10_000
DELIVERY_BASE_KM = 10
DELIVERY_PER_KM = 150


def _fee_for_km(km: float) -> int:
    beyond = max(0, km - DELIVERY_BASE_KM)
    return int((DELIVERY_BASE + beyond * DELIVERY_PER_KM + 500) // 1000 * 1000)


def compute_delivery_fee(town: str) -> int:
    # Every order pays transport by distance, whatever its size. Large orders
    # near Kampala used to go free here while checkout showed the customer a
    # fee, so the total they agreed to was not the total they were charged.
    km = TOWN_DISTANCE_KM.get(town.strip().lower(), 150)  # unknown → mid-distance
    return _fee_for_km(km)


def delivery_for_pin(lat: float | None, lng: float | None, quoted_km: float | None) -> tuple[int, float] | None:
    """Fee and road distance for a pin on the map, or None if there is no usable pin.

    The distance is the one we quoted the customer, so the fee they are
    charged is the fee they saw. If the figure sent back could not be a real
    road distance to that point, it is replaced by one worked out here.
    """
    if lat is None or lng is None or not delivery.in_range(lat, lng):
        return None
    km = quoted_km if quoted_km is not None and delivery.believable(lat, lng, quoted_km) else delivery.straight_km(lat, lng) * delivery.ROAD_FACTOR
    km = round(km, 1)
    return _fee_for_km(km), km


def _generate_reference() -> str:
    # The reference is all a customer needs to open their order, name and
    # address included, so it has to be too long to find by guessing. Orders
    # placed before this keep their six-character one.
    return "OTU-" + secrets.token_hex(4).upper()  # e.g. OTU-9F2A1C3B


def _with_option(name: str, option: str) -> str:
    """The product's name with the customer's chosen colour after it."""
    option = " ".join(option.split())
    return f"{name} — {option}"[:200] if option else name


def create_order(db: Session, payload: OrderCreate) -> Order:
    line_items: list[OrderItem] = []
    subtotal = 0
    # What a discount code may reduce: our own products only. A vendor is paid
    # the price they set, so their items are left out of the sum a code works on.
    own_subtotal = 0

    for item in payload.items:
        # Vendor marketplace item — slug is "vp-<vendor_product_id>"
        if item.slug.startswith("vp-"):
            try:
                vp_id = int(item.slug[3:])
            except ValueError:
                raise OrderError(f"Invalid product: {item.slug}") from None
            vp = db.get(VendorProduct, vp_id)
            if not vp or not vp.in_stock:
                raise OrderError(f"Marketplace item unavailable: {item.slug}")
            unit_price = int(vp.price_ugx)
            line_total = unit_price * item.quantity
            commission = commission_for(line_total)
            subtotal += line_total
            line_items.append(
                OrderItem(
                    product_slug=item.slug,
                    name=vp.name,
                    unit_price=unit_price,
                    quantity=item.quantity,
                    line_total=line_total,
                    vendor_id=vp.vendor_id,
                    commission=commission,
                )
            )
            continue

        product = get_product(db, item.slug)
        if not product:
            raise OrderError(f"Product not found: {item.slug}")
        if not product.get("in_stock", True):
            raise OrderError(f"Out of stock: {product['name']}")
        unit_price = int(product["price_ugx"])
        line_total = unit_price * item.quantity
        subtotal += line_total
        own_subtotal += line_total
        line_items.append(
            OrderItem(
                product_slug=product["slug"],
                name=_with_option(product["name"], item.option),
                unit_price=unit_price,
                quantity=item.quantity,
                line_total=line_total,
            )
        )
        # Reduce inventory for tracked house products (no-op for seed/untracked items).
        catalog.decrement_stock(db, product["slug"], item.quantity)

    # By the customer's pin on the map when they gave one; by their town otherwise.
    pin = delivery_for_pin(payload.delivery_lat, payload.delivery_lng, payload.delivery_km)
    delivery_fee = pin[0] if pin else compute_delivery_fee(payload.delivery_town)

    # Apply a discount coupon if one was supplied (server recomputes & records usage).
    discount, coupon_code = 0, ""
    if payload.coupon_code and own_subtotal > 0:
        discount, coupon_code = coupons.redeem(db, payload.coupon_code, own_subtotal)
        discount = min(discount, own_subtotal)

    total = max(0, subtotal - discount) + delivery_fee

    # Someone paying now is "pending" until we see the money; someone coming
    # to the shop is "unpaid" until they arrive. Nothing ships either way
    # until payment is confirmed.
    method = payload.payment_method.value
    payment_status = "unpaid" if method in ("pay_at_shop", "cash_on_delivery") else "pending"

    order = Order(
        reference=_generate_reference(),
        customer_name=payload.customer_name,
        phone=payload.phone,
        email=str(payload.email or ""),
        delivery_town=payload.delivery_town,
        delivery_address=payload.delivery_address,
        delivery_lat=payload.delivery_lat if pin else None,
        delivery_lng=payload.delivery_lng if pin else None,
        delivery_km=pin[1] if pin else None,
        notes=payload.notes,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=discount,
        coupon_code=coupon_code,
        total=total,
        payment_method=payload.payment_method.value,
        payment_status=payment_status,
        status="pending",
        items=line_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Affiliate: credit the referrer if a valid referral code was used.
    if payload.referral_code:
        try:
            from app.services import referrals
            referrals.credit_referral(db, payload.referral_code, order)
        except Exception:  # noqa: BLE001 — never fail an order over referral crediting
            db.rollback()

    return order


def sales_report(db: Session, days: int = 14) -> dict:
    """Aggregate sales figures for the admin report dashboard."""
    from collections import defaultdict
    from datetime import datetime, timedelta

    orders = list(db.execute(select(Order)).scalars().all())
    now = datetime.utcnow()
    since = now - timedelta(days=days)

    revenue = sum(int(o.total) for o in orders)
    # Confirmed revenue = money actually received (payment marked "paid").
    paid_revenue = sum(int(o.total) for o in orders if o.payment_status == "paid")
    # Expected but not yet collected (placed/confirmed but unpaid, excludes cancelled).
    pending_revenue = sum(
        int(o.total) for o in orders if o.payment_status != "paid" and o.status != "cancelled"
    )
    discounts = sum(int(getattr(o, "discount", 0) or 0) for o in orders)
    count = len(orders)
    delivered = sum(1 for o in orders if o.status == "delivered")
    pending = sum(1 for o in orders if o.status == "pending")
    avg = round(revenue / count) if count else 0

    def _naive(dt):
        # Postgres returns tz-aware datetimes; utcnow() is naive. Normalise to naive.
        return dt.replace(tzinfo=None) if dt and dt.tzinfo else dt

    # revenue per day (last `days`)
    by_day_rev: dict[str, int] = defaultdict(int)
    by_day_cnt: dict[str, int] = defaultdict(int)
    for o in orders:
        co = _naive(o.created_at)
        if co and co >= since:
            key = co.strftime("%Y-%m-%d")
            by_day_rev[key] += int(o.total)
            by_day_cnt[key] += 1
    by_day = []
    for i in range(days - 1, -1, -1):
        d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        by_day.append({"date": d, "revenue": by_day_rev.get(d, 0), "orders": by_day_cnt.get(d, 0)})

    # status breakdown
    status_counts: dict[str, int] = defaultdict(int)
    for o in orders:
        status_counts[o.status] += 1

    # top products by revenue
    prod_rev: dict[str, int] = defaultdict(int)
    prod_qty: dict[str, int] = defaultdict(int)
    for o in orders:
        for it in o.items:
            prod_rev[it.name] += int(it.line_total)
            prod_qty[it.name] += int(it.quantity)
    top_products = sorted(
        ({"name": n, "revenue": prod_rev[n], "qty": prod_qty[n]} for n in prod_rev),
        key=lambda x: x["revenue"], reverse=True,
    )[:8]

    return {
        "revenue": revenue,
        "paid_revenue": paid_revenue,
        "pending_revenue": pending_revenue,
        "discounts": discounts,
        "orders": count,
        "delivered": delivered,
        "pending": pending,
        "avg_order": avg,
        "by_day": by_day,
        "status_counts": dict(status_counts),
        "top_products": top_products,
    }


def _naive_dt(dt):
    """Postgres returns tz-aware datetimes; utcnow() is naive. Normalise to naive."""
    return dt.replace(tzinfo=None) if dt and dt.tzinfo else dt


def assess_orders(orders: list[Order]) -> dict[int, dict]:
    """Heuristic fraud/risk scoring for a batch of orders.

    Returns {order_id: {"level": none|low|medium|high, "reasons": [...]}}. Pure
    read-only signals — never blocks an order, just flags it for a human to review.
    """
    from collections import defaultdict

    by_phone: dict[str, list[Order]] = defaultdict(list)
    for o in orders:
        if o.phone:
            by_phone[o.phone.strip()].append(o)

    out: dict[int, dict] = {}
    for o in orders:
        score = 0
        reasons: list[str] = []
        total = int(o.total or 0)

        if total >= 5_000_000:
            score += 3
            reasons.append("Very high order value")
        elif total >= 2_000_000:
            score += 2
            reasons.append("High order value")

        co = _naive_dt(o.created_at)
        if o.phone and co:
            same = [
                x for x in by_phone[o.phone.strip()]
                if x.id != o.id and _naive_dt(x.created_at)
                and abs((_naive_dt(x.created_at) - co).total_seconds()) <= 86_400
            ]
            if len(same) >= 2:
                score += 3
                reasons.append(f"{len(same) + 1} orders from this phone in 24h")
            elif len(same) == 1:
                score += 1
                reasons.append("Repeat order from this phone")

        if o.payment_method not in ("pay_at_shop", "cash_on_delivery") and not o.email:
            score += 1
            reasons.append("No email on a mobile-money order")

        # A large order nobody has paid for is the one worth a phone call
        # before anything is set aside or dispatched.
        if o.payment_status != "paid" and total >= 2_000_000:
            score += 2
            reasons.append("Large order still unpaid")

        level = (
            "high" if score >= 4
            else "medium" if score >= 2
            else "low" if score >= 1
            else "none"
        )
        out[o.id] = {"level": level, "reasons": reasons}
    return out


def get_order(db: Session, reference: str) -> Order | None:
    return db.execute(
        select(Order).where(Order.reference == reference)
    ).scalar_one_or_none()


def list_orders(db: Session, limit: int = 100) -> list[Order]:
    return list(
        db.execute(select(Order).order_by(Order.created_at.desc()).limit(limit)).scalars().all()
    )


_ALLOWED_STATUS = {"pending", "confirmed", "processing", "shipped", "delivered", "cancelled"}
_ALLOWED_PAYMENT = {"pending", "unpaid", "paid", "refunded", "failed", "cancelled", "reversed"}


def delete_order(db: Session, reference: str) -> dict | None:
    """Admin: remove an order and its line items. Returns a summary, or None if missing.

    An order is a record of money, so the caller is told what it destroyed —
    the reference, the customer and the total — and that is what the admin puts
    in front of whoever pressed the button before it happens.

    Line items are deleted explicitly rather than relying on a cascade, because
    the relationship does not declare one and an orphaned item row would keep
    counting toward reports built from the items table.
    """
    order = get_order(db, reference)
    if not order:
        return None

    summary = {
        "reference": order.reference,
        "customer_name": order.customer_name,
        "total": float(order.total or 0),
        "status": order.status,
        "payment_status": order.payment_status,
    }

    db.query(OrderItem).filter(OrderItem.order_id == order.id).delete(synchronize_session=False)
    db.delete(order)
    db.commit()
    return summary


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
