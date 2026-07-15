from datetime import datetime

from pydantic import BaseModel, Field


class VendorProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    category: str = ""
    price_ugx: int = Field(ge=0)
    description: str = ""
    image_url: str = ""
    in_stock: bool = True


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
