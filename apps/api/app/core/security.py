"""Password hashing + signed auth tokens using only the Python standard library
(no external crypto deps to install/deploy).

- Passwords: PBKDF2-HMAC-SHA256 with a per-user random salt.
- Tokens: compact HMAC-SHA256 signed tokens (JWT-like) signed with SECRET_KEY.
"""

import base64
import hashlib
import hmac
import json
import secrets
import time

from app.core.config import settings

_PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_hex, hash_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iters))
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, AttributeError):
        return False


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def create_token(sub: int, role: str, expires_minutes: int | None = None) -> str:
    exp = int(time.time()) + (expires_minutes or settings.access_token_expire_minutes) * 60
    payload = _b64url(json.dumps({"sub": sub, "role": role, "exp": exp}).encode())
    sig = _b64url(hmac.new(settings.secret_key.encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}"


def decode_token(token: str) -> dict | None:
    """Return the token payload if the signature is valid and not expired, else None."""
    try:
        payload, sig = token.split(".")
        expected = _b64url(hmac.new(settings.secret_key.encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(_b64url_decode(payload))
        if data.get("exp", 0) < int(time.time()):
            return None
        return data
    except (ValueError, KeyError, json.JSONDecodeError):
        return None
