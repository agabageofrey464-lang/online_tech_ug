from datetime import datetime

from pydantic import BaseModel, Field


class JobIn(BaseModel):
    title: str
    type: str = "Full-time"
    category: str = "Software"
    location: str = "Kampala"
    summary: str = ""
    requirements: list[str] = Field(default_factory=list)
    openings: int = 1
    is_open: bool = True


class JobOut(JobIn):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
