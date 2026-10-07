from datetime import datetime

from pydantic import BaseModel, Field


class Spec(BaseModel):
    """One row of a product's specification table."""

    label: str = Field(min_length=1, max_length=60)
    value: str = Field(min_length=1, max_length=200)


class VendorProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    category: str = ""
    price_ugx: int = Field(ge=0)
    description: str = Field(default="", max_length=1000)
    image_url: str = ""
    in_stock: bool = True
    brand: str = Field(default="", max_length=80)
    condition: str = Field(default="Brand New", max_length=30)
    old_price_ugx: int | None = Field(default=None, ge=0)
    specs: list[Spec] = Field(default_factory=list, max_length=30)


class VendorProductOut(BaseModel):
    id: int
    vendor_id: int
    name: str
    category: str
    price_ugx: int
    description: str
    image_url: str
    in_stock: bool
    approved: bool = False
    created_at: datetime
    brand: str = ""
    condition: str = "Brand New"
    old_price_ugx: int | None = None
    specs: list[Spec] | None = None

    class Config:
        from_attributes = True


class MarketplaceItem(VendorProductOut):
    """Public marketplace item — includes the seller's display name & contacts."""

    vendor_name: str = ""
    vendor_verified: bool = False
    vendor_phone: str = ""
    vendor_email: str = ""


class PayoutIn(BaseModel):
    vendor_id: int
    amount: int = Field(ge=0)
    method: str = "Mobile Money"
    reference: str = ""
    note: str = ""
