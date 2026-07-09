"""Vendor product listings."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vendor_product import VendorProduct


def create(db: Session, vendor_id: int, data: dict) -> VendorProduct:
    row = VendorProduct(vendor_id=vendor_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_for_vendor(db: Session, vendor_id: int) -> list[VendorProduct]:
    stmt = select(VendorProduct).where(VendorProduct.vendor_id == vendor_id).order_by(VendorProduct.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def list_public(db: Session, limit: int = 60) -> list[VendorProduct]:
    """All in-stock vendor products (marketplace feed)."""
    stmt = (
        select(VendorProduct)
        .where(VendorProduct.in_stock.is_(True))
        .order_by(VendorProduct.created_at.desc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def delete(db: Session, vendor_id: int, product_id: int) -> bool:
    """Delete a product owned by this vendor. Returns True if deleted."""
    row = db.get(VendorProduct, product_id)
    if not row or row.vendor_id != vendor_id:
        return False
    db.delete(row)
    db.commit()
    return True
