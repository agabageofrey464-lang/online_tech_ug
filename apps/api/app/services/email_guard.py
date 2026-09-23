"""Decide whether an address is worth sending to.

Every message we send to an address that doesn't exist comes straight back as
a "Mail Delivery Subsystem" bounce in the company inbox — and because the same
bad address stays on the list, it comes back again on the next send. One
subscriber at example.com was enough to produce a bounce on every campaign.

So addresses are checked before anything is sent. This is deliberately a
syntax-and-known-bad-domain check, not a delivery check: it costs nothing, runs
offline, and catches the addresses that bounce every single time. Anything that
merely looks unusual is still sent — a real customer's address is worth far
more than a tidy inbox.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

# Deliberately permissive: one @, something either side, a dotted domain.
_ADDR = re.compile(r"^[^@\s,;]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}$")

# Reserved by RFC 2606 for documentation and testing. Mail to these is
# guaranteed to bounce — they exist so that it does.
RESERVED = {
    "example.com", "example.org", "example.net", "example.edu",
    "test", "test.com", "localhost", "localhost.localdomain",
    "invalid", "local", "internal", "none.com", "email.com",
}

# Typos we see often enough to be worth naming. Sending to these always bounces.
TYPO_DOMAINS = {
    "gmial.com", "gmai.com", "gmail.co", "gmaill.com", "gamil.com",
    "gmail.con", "gmail.cm", "gnail.com", "gmail.om",
    "yahooo.com", "yaho.com", "yahoo.co",
    "hotmial.com", "hotmai.com", "hotmal.com",
    "outlok.com", "outloo.com",
}


def problem(address: str) -> str | None:
    """Why this address shouldn't be sent to, or None if it's fine."""
    addr = (address or "").strip()
    if not addr:
        return "empty"
    if len(addr) > 254:
        return "too long"
    if not _ADDR.match(addr):
        return "not a valid address"

    domain = addr.rsplit("@", 1)[1].lower()
    if domain in RESERVED:
        return f"reserved test domain ({domain})"
    if domain in TYPO_DOMAINS:
        return f"misspelled domain ({domain})"
    return None


def deliverable(address: str) -> bool:
    return problem(address) is None


def suggest(address: str) -> str | None:
    """The address the customer probably meant, for a typo we recognise."""
    addr = (address or "").strip().lower()
    if "@" not in addr:
        return None
    local, domain = addr.rsplit("@", 1)
    fixes = {
        "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com",
        "gmaill.com": "gmail.com", "gamil.com": "gmail.com", "gmail.con": "gmail.com",
        "gmail.cm": "gmail.com", "gnail.com": "gmail.com", "gmail.om": "gmail.com",
        "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com",
        "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com",
        "hotmal.com": "hotmail.com",
        "outlok.com": "outlook.com", "outloo.com": "outlook.com",
    }
    fixed = fixes.get(domain)
    return f"{local}@{fixed}" if fixed else None
