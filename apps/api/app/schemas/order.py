from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PaymentMethod(str, Enum):
    cash_on_delivery = "cash_on_delivery"
    mtn_momo = "mtn_momo"
    airtel_money = "airtel_money"
    pesapal = "pesapal"  # secure online payment (MTN/Airtel/card via Pesapal)


class OrderItemIn(BaseModel):
    slug: str
    quantity: int = Field(default=1, ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=5, max_length=40)
    email: EmailStr | str = ""
    delivery_town: str = Field(default="", max_length=120)
    delivery_address: str = ""
    notes: str = ""
    payment_method: PaymentMethod = PaymentMethod.cash_on_delivery
    coupon_code: str = ""
    referral_code: str = ""
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_slug: str
    name: str
    unit_price: int
    quantity: int
    line_total: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    customer_name: str
    phone: str
    email: str
    delivery_town: str
    delivery_address: str
    notes: str
    subtotal: int
    delivery_fee: int
    discount: int = 0
    coupon_code: str = ""
    total: int
    payment_method: str
    payment_status: str
    status: str
    currency: str = "UGX"
    pesapal_tracking_id: str = ""
    created_at: datetime | None = None
    items: list[OrderItemOut]


class OrderSummary(BaseModel):
    """Lightweight row for admin order lists."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    customer_name: str
    phone: str
    total: int
    payment_method: str
    payment_status: str
    status: str
    pesapal_tracking_id: str = ""
    created_at: datetime | None = None
    # Fraud/risk signals (computed, not stored)
    risk_level: str = "none"
    risk_reasons: list[str] = []


class OrderUpdate(BaseModel):
    """Admin: update an order's fulfilment status and/or payment status."""

    status: str | None = None
    payment_status: str | None = None
