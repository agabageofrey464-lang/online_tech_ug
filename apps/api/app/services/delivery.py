"""Transport worked out from where the customer actually is.

The customer marks their place on a map. We measure the road distance from
the shop to that point and charge by the kilometre — the same sum whether
they are in a town on our list or a village that is not.

The road distance comes from a routing service. When it cannot be reached we
do not refuse the customer a price: we take the straight-line distance and
allow for the bends in the road.
"""

from __future__ import annotations

import logging
import math

import httpx

logger = logging.getLogger(__name__)

# The shop: Mabirizi Complex, Kampala.
SHOP_LAT = 0.3153705
SHOP_LNG = 32.5777552

# Roads in Uganda run about a third longer than the straight line between
# their ends. Used when the routing service gives no answer.
ROAD_FACTOR = 1.3

# Roughly Uganda, with a margin. A pin outside this is a mistake, not a delivery.
LAT_RANGE = (-1.6, 4.4)
LNG_RANGE = (29.4, 35.2)

ROUTER = "https://router.project-osrm.org/route/v1/driving/{lng0},{lat0};{lng1},{lat1}?overview=false"

# Answers already measured, by the point rounded to about ten metres, so a
# customer moving between pages is not measured again each time.
_measured: dict[tuple[float, float], float] = {}


def in_range(lat: float, lng: float) -> bool:
    return LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LNG_RANGE[0] <= lng <= LNG_RANGE[1]


def straight_km(lat: float, lng: float) -> float:
    """Straight-line kilometres from the shop to a point."""
    p1, p2 = math.radians(SHOP_LAT), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lng - SHOP_LNG)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(a))


def believable(lat: float, lng: float, km: float) -> bool:
    """Whether a road distance the customer's browser sent back could be true.

    The fee is charged on the distance we quoted, which the browser returns
    with the order. A road is never shorter than the straight line and is not
    several times longer, so a figure outside that is ignored and measured afresh.
    """
    straight = straight_km(lat, lng)
    return straight * 0.98 <= km <= straight * 2.5 + 3


async def road_km(lat: float, lng: float) -> tuple[float, bool]:
    """Road kilometres from the shop, and whether it was measured along the road."""
    key = (round(lat, 4), round(lng, 4))
    if key in _measured:
        return _measured[key], True
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(ROUTER.format(lng0=SHOP_LNG, lat0=SHOP_LAT, lng1=lng, lat1=lat))
        data = res.json()
        km = float(data["routes"][0]["distance"]) / 1000.0
        if believable(lat, lng, km):
            if len(_measured) > 5000:
                _measured.clear()
            _measured[key] = km
            return km, True
    except Exception as exc:  # noqa: BLE001
        logger.info("Road distance unavailable (%s); using the straight line.", exc)
    return straight_km(lat, lng) * ROAD_FACTOR, False

