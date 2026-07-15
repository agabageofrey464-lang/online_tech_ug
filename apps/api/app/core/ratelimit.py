"""Tiny in-memory sliding-window rate limiter.

Good enough for a single-process uvicorn deployment (our systemd service runs
one worker). Keyed by an arbitrary string (IP, email, user id). Not shared
across processes — if we ever scale to multiple workers, move this to Redis.
"""

import threading
import time
from collections import defaultdict, deque

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
