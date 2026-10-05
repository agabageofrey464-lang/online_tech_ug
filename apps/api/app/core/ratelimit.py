"""Tiny in-memory sliding-window rate limiter.

Good enough for a single-process uvicorn deployment (our systemd service runs
one worker). Keyed by an arbitrary string (IP, email, user id). Not shared
across processes — if we ever scale to multiple workers, move this to Redis.
"""

import threading
import time
from collections import defaultdict, deque

from fastapi import Request

_hits: dict[str, deque[float]] = defaultdict(deque)
_lock = threading.Lock()


def allow(key: str, limit: int, window_seconds: int) -> bool:
    """Record a hit for `key`. Returns False if it exceeds `limit` per window."""
    now = time.monotonic()
    cutoff = now - window_seconds
    with _lock:
        q = _hits[key]
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= limit:
            return False
        q.append(now)
        return True


def exceeded(key: str, limit: int, window_seconds: int) -> bool:
    """True if `key` has already used its `limit`. Looks without recording a hit."""
    cutoff = time.monotonic() - window_seconds
    with _lock:
        q = _hits[key]
        while q and q[0] < cutoff:
            q.popleft()
        return len(q) >= limit


def client_ip(request: Request) -> str:
    """Real client IP, honouring the nginx X-Forwarded-For header."""
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def peer_ip(request: Request) -> str:
    """The address that actually connected to nginx.

    nginx appends it to X-Forwarded-For, so it is the last entry and the only
    one a caller cannot make up. Shop traffic arrives through Vercel and shares
    a handful of these, so only use it to count something honest visitors
    rarely do.
    """
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"
