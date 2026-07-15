"""Subscription management — admin sets durations; a daily sweep expires them."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services import subscriptions

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/sweep", dependencies=[Depends(require_admin)])
async def run_sweep(db: Session = Depends(get_db)) -> dict:
    """Deactivate expired listings and send notifications. Called by a daily cron."""
    return await subscriptions.sweep(db)


@router.post("/set", dependencies=[Depends(require_admin)])
def set_sub(kind: str, id: int, days: int, db: Session = Depends(get_db)) -> dict:
    """Set/extend a subscription: kind = vendor|freelancer|advert, id, days."""
    res = subscriptions.set_subscription(db, kind, id, days)
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return res
