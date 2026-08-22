"""Pesapal API 3.0 — Mobile Money (MTN/Airtel) & card payments for Uganda.

Flow: RequestToken -> RegisterIPN (once) -> SubmitOrderRequest (redirect the
customer) -> Pesapal calls our IPN + we call GetTransactionStatus -> mark paid.

An order is only ever marked paid when GetTransactionStatus reports "Completed" —
reaching the payment page never marks it paid.
"""

import logging
import time

import httpx

from app.core.config import settings

logger = logging.getLogger("onlinetech.pesapal")

# In-process caches (fine for a single API process; re-fetched on restart).
_token_cache: dict = {"token": "", "exp": 0.0}
_ipn_cache: dict = {"id": ""}


def configured() -> bool:
    return bool(settings.pesapal_consumer_key and settings.pesapal_consumer_secret)


def _base() -> str:
    return "https://pay.pesapal.com/v3" if settings.pesapal_env == "live" else "https://cybqa.pesapal.com/pesapalv3"


def _headers(token: str | None = None) -> dict:
    h = {"Accept": "application/json", "Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


async def _token(client: httpx.AsyncClient) -> str:
    """Bearer token (valid ~5 min); cached and refreshed as needed."""
    now = time.time()
    if _token_cache["token"] and _token_cache["exp"] > now + 30:
        return _token_cache["token"]
    resp = await client.post(
        f"{_base()}/api/Auth/RequestToken",
        json={"consumer_key": settings.pesapal_consumer_key, "consumer_secret": settings.pesapal_consumer_secret},
        headers=_headers(),
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("token")
    if not token:
        raise RuntimeError(data.get("error") or data.get("message") or "Pesapal auth failed")
    _token_cache["token"] = token
    _token_cache["exp"] = now + 290
    return token


async def ensure_ipn(client: httpx.AsyncClient) -> str:
    """Return the IPN id, registering our IPN URL with Pesapal once if needed."""
    if settings.pesapal_ipn_id:
        return settings.pesapal_ipn_id
    if _ipn_cache["id"]:
        return _ipn_cache["id"]
    token = await _token(client)
    ipn_url = f"{settings.api_public_url}{settings.api_v1_prefix}/payments/pesapal/ipn"
    resp = await client.post(
        f"{_base()}/api/URLSetup/RegisterIPN",
        json={"url": ipn_url, "ipn_notification_type": "GET"},
        headers=_headers(token),
    )
    resp.raise_for_status()
    data = resp.json()
    ipn_id = data.get("ipn_id")
    if not ipn_id:
        raise RuntimeError(data.get("error") or "Pesapal IPN registration failed")
    _ipn_cache["id"] = ipn_id
    return ipn_id


def _split_name(name: str) -> tuple[str, str]:
    parts = (name or "Customer").strip().split(" ", 1)
    return (parts[0], parts[1] if len(parts) > 1 else "")


async def submit_order(
    *, merchant_ref: str, amount: int, currency: str, description: str,
    callback_url: str, email: str, phone: str, name: str,
) -> dict:
    """Create a Pesapal order. Returns {order_tracking_id, redirect_url}."""
    async with httpx.AsyncClient(timeout=30) as client:
        token = await _token(client)
        ipn_id = await ensure_ipn(client)
        first, last = _split_name(name)
        payload = {
            "id": merchant_ref,
            "currency": currency,
            "amount": amount,
            "description": (description or "Payment")[:100],
            "callback_url": callback_url,
            "notification_id": ipn_id,
            "billing_address": {
                "email_address": email or "",
                "phone_number": phone or "",
                "first_name": first,
                "last_name": last,
            },
        }
        resp = await client.post(
            f"{_base()}/api/Transactions/SubmitOrderRequest", json=payload, headers=_headers(token)
        )
        resp.raise_for_status()
        data = resp.json()
    if data.get("error") and (data["error"].get("code") or data["error"].get("message")):
        raise RuntimeError(data["error"].get("message") or "Pesapal order failed")
    link = data.get("redirect_url")
    tracking = data.get("order_tracking_id")
    if not link or not tracking:
        raise RuntimeError(data.get("message") or "Pesapal did not return a checkout link")
    return {"order_tracking_id": tracking, "redirect_url": link}


async def transaction_status(order_tracking_id: str) -> dict:
    """Query the authoritative status of a transaction from Pesapal."""
    async with httpx.AsyncClient(timeout=30) as client:
        token = await _token(client)
        resp = await client.get(
            f"{_base()}/api/Transactions/GetTransactionStatus",
            params={"orderTrackingId": order_tracking_id},
            headers=_headers(token),
        )
        resp.raise_for_status()
        return resp.json()


# Pesapal payment_status_description values -> our normalised state.
def normalise_status(data: dict) -> str:
    desc = str(data.get("payment_status_description", "")).strip().lower()
    if desc == "completed":
        return "completed"
    if desc in ("failed", "invalid", "reversed"):
        return desc
    return "pending"


async def verify_transaction(order_tracking_id: str) -> dict:
    """Authoritative verification used by BOTH the IPN and the return check.
    Returns a normalised result — never trusts anything but Pesapal's own API."""
    data = await transaction_status(order_tracking_id)
    return {
        "success": normalise_status(data) == "completed",
        "status": normalise_status(data),  # completed | failed | invalid | reversed | pending
        "tracking_id": order_tracking_id,
        "merchant_reference": str(data.get("merchant_reference", "")),
        "amount": float(data.get("amount") or 0),
        "currency": str(data.get("currency", "")).upper(),
        "payment_method": str(data.get("payment_method", "")),
        "raw": data,
    }
