from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str = ""
    role: Literal["customer", "vendor"] = "customer"
    business_name: str = ""  # required for vendors
    business_category: str = ""
    location: str = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    business_name: str
    vendor_approved: bool
    email_verified: bool
    twofa_enabled: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginResult(BaseModel):
    """Login response: either a token, or a 2FA challenge (twofa_required=True)."""

    twofa_required: bool = False
    access_token: str = ""
    token_type: str = "bearer"
    user: UserOut | None = None


class CodeIn(BaseModel):
    code: str = Field(min_length=4, max_length=10)


class LoginOtpIn(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=10)


class ToggleIn(BaseModel):
    enabled: bool


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=10)
    password: str = Field(min_length=6, max_length=128)
