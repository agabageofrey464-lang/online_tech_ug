from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services import push

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class SubscribeIn(BaseModel):
    subscription: dict
    email: str = ""


class UnsubscribeIn(BaseModel):
    endpoint: str


class PushIn(BaseModel):
    title: str
    body: str = ""
    url: str = "/shop"
    image: str = ""


@router.get("/public-key")
def public_key() -> dict:
    """Public: the VAPID key the browser needs to subscribe. Empty = push off."""
    return {"key": settings.vapid_public_key, "enabled": push.configured()}


@router.post("/subscribe", status_code=201)
def subscribe(payload: SubscribeIn, request: Request, db: Session = Depends(get_db)) -> dict:
    try:
        return push.save_subscription(
            db, payload.subscription, request.headers.get("user-agent", ""), payload.email
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/unsubscribe")
def unsubscribe(payload: UnsubscribeIn, db: Session = Depends(get_db)) -> dict:
    return {"ok": push.remove_subscription(db, payload.endpoint)}


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)) -> dict:
    return push.stats(db)


@router.post("/admin/send", dependencies=[Depends(require_admin)])
async def admin_send(payload: PushIn, db: Session = Depends(get_db)) -> dict:
    try:
        return await push.broadcast(db, payload.title, payload.body, payload.url, payload.image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
