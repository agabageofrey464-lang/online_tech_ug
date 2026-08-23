from datetime import datetime

from pydantic import BaseModel


class GenerateIn(BaseModel):
    course_slug: str
    note: str = ""
    lesson: int | None = None  # 1-based lesson number; null = whole course


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
    device_token: str = ""


class VerifyOut(BaseModel):
    valid: bool
    lesson: int | None = None
    reason: str = ""


class UnlockCodeOut(BaseModel):
    id: int
    code: str
    course_slug: str
    lesson: int | None = None
    used: bool = False
    note: str
    redeemed_count: int
    revoked: bool
    created_at: datetime
    last_used: datetime | None = None
