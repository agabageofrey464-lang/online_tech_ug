from datetime import datetime

from pydantic import BaseModel


class GenerateIn(BaseModel):
    course_slug: str
    note: str = ""


class RegisterIn(BaseModel):
    course_slug: str
    name: str
    phone: str
    email: str = ""


class RegisterOut(BaseModel):
    code: str
    course_slug: str
    pending: bool = True


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
