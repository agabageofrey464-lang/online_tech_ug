from datetime import datetime

from pydantic import BaseModel


class GenerateIn(BaseModel):
    course_slug: str
    note: str = ""


class VerifyIn(BaseModel):
    course_slug: str
    code: str


class VerifyOut(BaseModel):
    valid: bool


class UnlockCodeOut(BaseModel):
    id: int
    code: str
    course_slug: str
    note: str
    redeemed_count: int
    revoked: bool
    created_at: datetime
    last_used: datetime | None = None
