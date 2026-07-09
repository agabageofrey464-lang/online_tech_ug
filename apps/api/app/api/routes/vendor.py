from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.vendor_product import VendorProductIn, VendorProductOut
from app.services import vendor_products

router = APIRouter()


def require_vendor(user: User = Depends(get_current_user)) -> User:
    if user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendor account required")
    return user


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
@router.get("/marketplace", response_model=list[VendorProductOut])
def marketplace(db: Session = Depends(get_db)) -> list:
    return vendor_products.list_public(db)
