"""Flutterwave online payments — MTN MoMo, Airtel Money & cards (Uganda).

Standard flow: create a payment -> redirect the customer to Flutterwave's
hosted checkout -> verify the transaction on return / webhook.
"""

import httpx

from app.core.config import settings

BASE = "https://api.flutterwave.com/v3"


def configured() -> bool:
    return bool(settings.flutterwave_secret_key)


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.flutterwave_secret_key}"}


async def create_payment(
    *, amount: int, email: str, phone: str, name: str, tx_ref: str, redirect_url: str, meta: dict | None = None
) -> str:
    """Create a hosted-checkout payment. Returns the payment link to redirect to."""
    payload = {
        "tx_ref": tx_ref,
        "amount": str(amount),
        "currency": "UGX",
        "redirect_url": redirect_url,
        "payment_options": "mobilemoneyuganda, card",
        "customer": {
            "email": email or "customer@onlinetechug.com",
            "phonenumber": phone or "",
            "name": name or "Customer",
        },
        "customizations": {
            "title": "Online Tech Uganda",
            "description": "Payment for your order",
        },
        "meta": meta or {},
    }
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(f"{BASE}/payments", json=payload, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
    link = (data.get("data") or {}).get("link")
    if not link:
        raise RuntimeError(data.get("message") or "Could not start payment")
    return link


async def verify(transaction_id: str) -> dict:
    """Verify a transaction by its Flutterwave id. Returns the transaction data."""
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(f"{BASE}/transactions/{transaction_id}/verify", headers=_headers())
        resp.raise_for_status()
        return resp.json().get("data") or {}
