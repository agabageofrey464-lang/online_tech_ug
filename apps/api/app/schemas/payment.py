from pydantic import BaseModel, Field


class PaymentIn(BaseModel):
    payer_name: str = Field(min_length=2, max_length=160)
    phone: str = ""
    amount: int = Field(ge=0)
    purpose: str = ""
    method: str = "MTN Mobile Money"
    txn_ref: str = ""
    note: str = ""


class StatusIn(BaseModel):
    status: str
