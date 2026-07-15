from datetime import datetime

from pydantic import BaseModel


class AdvertIn(BaseModel):
    title: str
    advertiser: str = ""
    description: str = ""
    image_url: str = ""
    link_url: str = ""
    placement: str = "advertise"
    category: str = "Business"
    active: bool = True


class AdvertOut(AdvertIn):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
