from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.coupon import CouponIn, CouponOut, CouponValidateIn, CouponValidateOut
from app.services import coupons as coupons_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/validate", response_model=CouponValidateOut)
def validate_coupon(payload: CouponValidateIn, db: Session = Depends(get_db)) -> dict:
    """Public: check a discount code against a cart subtotal."""
    return coupons_service.validate(db, payload.code, payload.subtotal)


@router.get("", response_model=list[CouponOut], dependencies=[Depends(require_admin)])
def list_coupons(db: Session = Depends(get_db)) -> list:
    return coupons_service.list_coupons(db)


@router.post("", response_model=CouponOut, status_code=201, dependencies=[Depends(require_admin)])
def create_coupon(payload: CouponIn, db: Session = Depends(get_db)) -> CouponOut:
    return coupons_service.create(db, payload.model_dump())


@router.delete("/{coupon_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_coupon(coupon_id: int, db: Session = Depends(get_db)) -> None:
    if not coupons_service.delete(db, coupon_id):
        raise HTTPException(status_code=404, detail="Coupon not found")
