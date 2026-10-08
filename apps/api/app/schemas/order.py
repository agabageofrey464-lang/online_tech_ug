from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PaymentMethod(str, Enum):
    """How the customer is paying.

    We don't collect on delivery: an order is paid first, or collected and
    paid for at the shop. Delivery is of goods already paid for.

    `cash_on_delivery` is kept only so orders taken before that rule can still
    be read back; it is not offered at checkout.
    """

    mtn_momo = "mtn_momo"
    airtel_money = "airtel_money"
    pay_at_shop = "pay_at_shop"  # collect and pay in person in Kampala
    pesapal = "pesapal"  # secure online payment (MTN/Airtel/card via Pesapal)
    cash_on_delivery = "cash_on_delivery"  # legacy — historical orders only


class OrderItemIn(BaseModel):
    slug: str
    quantity: int = Field(default=1, ge=1, le=99)
    # What the customer chose on the product page — a colour. Written onto the
    # order line so whoever packs the order knows which one to send.
    option: str = Field(default="", max_length=60)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=5, max_length=40)
    email: EmailStr | str = ""
    delivery_town: str = Field(default="", max_length=120)
    delivery_address: str = ""
    notes: str = ""
    payment_method: PaymentMethod = PaymentMethod.mtn_momo
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
    email: str = ""
    total: int
    payment_method: str
    payment_status: str
    status: str
    pesapal_tracking_id: str = ""
    created_at: datetime | None = None
    # Fraud/risk signals (computed, not stored)
    risk_level: str = "none"
    risk_reasons: list[str] = []
    # "2 x HP EliteBook 840 G6" — so a reply can name what they bought.
    items_summary: str = ""


class OrderUpdate(BaseModel):
    """Admin: update an order's fulfilment status and/or payment status."""

    status: str | None = None
    payment_status: str | None = None
