"""Vendor product listings."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.vendor_payout import VendorPayout
from app.models.vendor_product import VendorProduct


def create(db: Session, vendor_id: int, data: dict) -> VendorProduct:
    row = VendorProduct(vendor_id=vendor_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update(db: Session, vendor_id: int, product_id: int, data: dict) -> VendorProduct | None:
    """Update a vendor's OWN product. Returns None if not found / not theirs."""
    row = db.get(VendorProduct, product_id)
    if not row or row.vendor_id != vendor_id:
        return None
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


def list_for_vendor(db: Session, vendor_id: int) -> list[VendorProduct]:
    stmt = select(VendorProduct).where(VendorProduct.vendor_id == vendor_id).order_by(VendorProduct.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def list_public(db: Session, limit: int = 60) -> list[dict]:
    """Approved, in-stock vendor products (marketplace feed), with the seller's name."""
    stmt = (
        select(VendorProduct, User.business_name, User.name, User.verified, User.phone, User.email)
        .join(User, User.id == VendorProduct.vendor_id)
        .where(VendorProduct.in_stock.is_(True), VendorProduct.approved.is_(True))
        .order_by(VendorProduct.created_at.desc())
        .limit(limit)
    )
    return [_public(*row) for row in db.execute(stmt).all()]


def _public(vp: VendorProduct, business_name, name, verified, phone, email) -> dict:
    return {
        "id": vp.id,
        "vendor_id": vp.vendor_id,
        "name": vp.name,
        "category": vp.category,
        "price_ugx": vp.price_ugx,
        "description": vp.description,
        "image_url": vp.image_url,
        "in_stock": vp.in_stock,
        "approved": vp.approved,
        "created_at": vp.created_at,
        "brand": vp.brand or "",
        "condition": vp.condition or "Brand New",
        "old_price_ugx": vp.old_price_ugx,
        "specs": vp.specs or [],
        "vendor_name": business_name or name or "Marketplace seller",
        "vendor_verified": bool(verified),
        # Blank unless the owner has let vendors be contacted directly: the
        # site then falls back to its own number for every order.
        "vendor_phone": (phone or "") if settings.vendor_contacts_public else "",
        "vendor_email": (email or "") if settings.vendor_contacts_public else "",
    }


def get_public(db: Session, product_id: int) -> dict | None:
    """One approved vendor product, for its own page. Out-of-stock ones are
    still returned, so a shared link says "out of stock" rather than vanishing."""
    row = db.execute(
        select(VendorProduct, User.business_name, User.name, User.verified, User.phone, User.email)
        .join(User, User.id == VendorProduct.vendor_id)
        .where(VendorProduct.id == product_id, VendorProduct.approved.is_(True))
    ).first()
    return _public(*row) if row else None


def list_all_for_admin(db: Session, pending_only: bool = False) -> list[dict]:
    """Every vendor product with seller name + approval status (admin moderation)."""
    stmt = (
        select(VendorProduct, User.business_name, User.name)
        .join(User, User.id == VendorProduct.vendor_id)
        .order_by(VendorProduct.approved.asc(), VendorProduct.created_at.desc())
    )
    if pending_only:
        stmt = stmt.where(VendorProduct.approved.is_(False))
    out: list[dict] = []
    for vp, business_name, name in db.execute(stmt).all():
        out.append({
            "id": vp.id, "vendor_id": vp.vendor_id, "name": vp.name, "category": vp.category,
            "price_ugx": vp.price_ugx, "image_url": vp.image_url, "in_stock": vp.in_stock,
            "approved": vp.approved, "created_at": vp.created_at,
            "vendor_name": business_name or name or "Vendor",
        })
    return out


def set_product_approved(db: Session, product_id: int, approved: bool) -> VendorProduct | None:
    row = db.get(VendorProduct, product_id)
    if not row:
        return None
    row.approved = approved
    db.commit()
    db.refresh(row)
    return row


def delete(db: Session, vendor_id: int, product_id: int) -> bool:
    """Delete a product owned by this vendor. Returns True if deleted."""
    row = db.get(VendorProduct, product_id)
    if not row or row.vendor_id != vendor_id:
        return False
    db.delete(row)
    db.commit()
    return True


def vendor_earnings(db: Session, vendor_id: int) -> dict:
    """A vendor's sales, the platform commission taken, and their net payout."""
    rows = db.execute(
        select(OrderItem, Order.reference, Order.status, Order.payment_status)
        .join(Order, Order.id == OrderItem.order_id)
        .where(OrderItem.vendor_id == vendor_id)
        .order_by(OrderItem.id.desc())
    ).all()
    gross = commission = 0
    sales = []
    for oi, ref, status, pay in rows:
        lt, comm = int(oi.line_total), int(oi.commission)
        gross += lt
        commission += comm
        sales.append({
            "reference": ref, "name": oi.name, "quantity": oi.quantity,
            "line_total": lt, "commission": comm, "payout": lt - comm,
            "status": status, "payment_status": pay,
        })
    paid = int(
        db.execute(select(func.coalesce(func.sum(VendorPayout.amount), 0))
                   .where(VendorPayout.vendor_id == vendor_id)).scalar_one()
    )
    net = gross - commission
    return {"gross": gross, "commission": commission, "payout": net,
            "paid": paid, "outstanding": net - paid,
            "orders": len(sales), "sales": sales}


def platform_commissions(db: Session) -> dict:
    """Admin: total platform commission + per-vendor payout owed (marketplace earnings)."""
    total_commission = int(
        db.execute(select(func.coalesce(func.sum(OrderItem.commission), 0))
                   .where(OrderItem.vendor_id.is_not(None))).scalar_one()
    )
    total_gross = int(
        db.execute(select(func.coalesce(func.sum(OrderItem.line_total), 0))
                   .where(OrderItem.vendor_id.is_not(None))).scalar_one()
    )
    # Per-vendor breakdown
    rows = db.execute(
        select(
            OrderItem.vendor_id,
            User.business_name,
            User.name,
            func.coalesce(func.sum(OrderItem.line_total), 0),
            func.coalesce(func.sum(OrderItem.commission), 0),
        )
        .join(User, User.id == OrderItem.vendor_id)
        .where(OrderItem.vendor_id.is_not(None))
        .group_by(OrderItem.vendor_id, User.business_name, User.name)
    ).all()
    # Payouts already settled, per vendor
    paid_rows = db.execute(
        select(VendorPayout.vendor_id, func.coalesce(func.sum(VendorPayout.amount), 0))
        .group_by(VendorPayout.vendor_id)
    ).all()
    paid_by_vendor = {vid: int(amt) for vid, amt in paid_rows}
    total_paid = sum(paid_by_vendor.values())

    vendors = []
    for vid, bname, name, g, c in rows:
        earned = int(g) - int(c)  # net owed from sales
        paid = paid_by_vendor.get(vid, 0)
        vendors.append({
            "vendor_id": vid, "vendor_name": bname or name or "Vendor",
            "gross": int(g), "commission": int(c),
            "payout": earned, "paid": paid, "outstanding": earned - paid,
        })
    return {
        "total_commission": total_commission,
        "total_gross": total_gross,
        "vendor_payout_owed": total_gross - total_commission,
        "total_paid": total_paid,
        "outstanding": (total_gross - total_commission) - total_paid,
        "vendors": vendors,
    }


def record_payout(db: Session, vendor_id: int, data: dict) -> VendorPayout:
    row = VendorPayout(vendor_id=vendor_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_payouts(db: Session, limit: int = 100) -> list[dict]:
    stmt = (
        select(VendorPayout, User.business_name, User.name)
        .join(User, User.id == VendorPayout.vendor_id)
        .order_by(VendorPayout.created_at.desc())
        .limit(limit)
    )
    out = []
    for p, bname, name in db.execute(stmt).all():
        out.append({
            "id": p.id, "vendor_id": p.vendor_id, "vendor_name": bname or name or "Vendor",
            "amount": p.amount, "method": p.method, "reference": p.reference,
            "note": p.note, "created_at": p.created_at,
        })
    return out
