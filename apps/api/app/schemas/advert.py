from datetime import datetime

from pydantic import BaseModel, Field


class AdvertIn(BaseModel):
    # Length limits match the DB columns, so oversized input returns a clear
    # 422 error instead of a 500.
    title: str = Field(min_length=1, max_length=200)
    advertiser: str = Field(default="", max_length=160)
    description: str = Field(default="", max_length=4000)
    image_url: str = Field(default="", max_length=500)
    link_url: str = Field(default="", max_length=500)
    placement: str = Field(default="advertise", max_length=40)
    category: str = Field(default="Business", max_length=60)
    active: bool = True


class AdvertOut(AdvertIn):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
