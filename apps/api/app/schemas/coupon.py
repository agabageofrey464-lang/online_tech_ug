from datetime import datetime

from pydantic import BaseModel, Field


class CouponIn(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    discount_type: str = "percent"  # "percent" | "fixed"
    value: int = Field(ge=0)
    min_subtotal: int = 0
    max_uses: int = 0
    active: bool = True
    expires_at: datetime | None = None


class CouponOut(CouponIn):
    id: int
    used_count: int = 0
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class CouponValidateIn(BaseModel):
    code: str
    subtotal: int = Field(ge=0)


class CouponValidateOut(BaseModel):
    valid: bool
    discount: int = 0
    code: str = ""
    message: str = ""
