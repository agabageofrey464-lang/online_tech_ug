from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.vendor_product import VendorProduct
from app.schemas.vendor_product import MarketplaceItem, VendorProductIn, VendorProductOut
from app.services import vendor_products

router = APIRouter()


def require_vendor(user: User = Depends(get_current_user)) -> User:
    if user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendor account required")
    return user


def require_admin_key(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def require_approved_vendor(user: User = Depends(require_vendor)) -> User:
    if not user.vendor_approved:
        raise HTTPException(status_code=403, detail="Your vendor account is pending approval")
    return user


@router.get("/products", response_model=list[VendorProductOut])
def my_products(user: User = Depends(require_vendor), db: Session = Depends(get_db)) -> list:
    return vendor_products.list_for_vendor(db, user.id)


@router.post("/products", response_model=VendorProductOut, status_code=201)
def add_product(
    payload: VendorProductIn,
    user: User = Depends(require_approved_vendor),
    db: Session = Depends(get_db),
):
    return vendor_products.create(db, user.id, payload.model_dump())


@router.delete("/products/{product_id}", status_code=204)
def remove_product(
    product_id: int, user: User = Depends(require_vendor), db: Session = Depends(get_db)
) -> None:
    if not vendor_products.delete(db, user.id, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


# Public marketplace feed of all vendor products.
@router.get("/marketplace", response_model=list[MarketplaceItem])
def marketplace(db: Session = Depends(get_db)) -> list:
    return vendor_products.list_public(db)


# --- Admin vendor management (admin-key gated) ---
@router.get("/admin/list", dependencies=[Depends(require_admin_key)])
def admin_list_vendors(db: Session = Depends(get_db)) -> list[dict]:
    users = db.execute(select(User).where(User.role == "vendor").order_by(User.created_at.desc())).scalars().all()
    out = []
    for u in users:
        count = db.execute(
            select(func.count()).select_from(VendorProduct).where(VendorProduct.vendor_id == u.id)
        ).scalar_one()
        out.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
            "business_name": u.business_name, "vendor_approved": u.vendor_approved, "products": count,
        })
    return out


@router.post("/admin/{vendor_id}/approve", dependencies=[Depends(require_admin_key)])
def admin_approve_vendor(vendor_id: int, approved: bool = True, db: Session = Depends(get_db)) -> dict:
    u = db.get(User, vendor_id)
    if not u or u.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    u.vendor_approved = approved
    db.commit()
    return {"id": u.id, "vendor_approved": u.vendor_approved}
