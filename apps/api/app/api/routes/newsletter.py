from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services import newsletter

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class SubscribeIn(BaseModel):
    email: str
    name: str = ""
    source: str = "website"


class BroadcastIn(BaseModel):
    subject: str
    body_html: str
    include_customers: bool = True


@router.post("/subscribe", status_code=201)
def subscribe(payload: SubscribeIn, db: Session = Depends(get_db)) -> dict:
    """Public: join the list for new stock, offers and discounts."""
    try:
        row = newsletter.subscribe(db, payload.email, payload.name, payload.source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"ok": True, "email": row["email"]}


@router.get("/unsubscribe")
def unsubscribe(token: str = Query(...), db: Session = Depends(get_db)) -> dict:
    """Public: one-click opt-out from any campaign email."""
    return {"ok": newsletter.unsubscribe(db, token)}


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)) -> dict:
    return newsletter.stats(db)


@router.get("/admin/list", dependencies=[Depends(require_admin)])
def admin_list(active_only: bool = Query(default=False), db: Session = Depends(get_db)) -> list[dict]:
    return newsletter.list_subscribers(db, active_only)


@router.post("/admin/broadcast", dependencies=[Depends(require_admin)])
async def admin_broadcast(payload: BroadcastIn, db: Session = Depends(get_db)) -> dict:
    """Admin: send one campaign (new arrivals, an offer, a discount) to the list."""
    try:
        return await newsletter.broadcast(
            db, payload.subject, payload.body_html, payload.include_customers
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/admin/digest/preview", dependencies=[Depends(require_admin)])
def digest_preview(db: Session = Depends(get_db)) -> dict:
    """What today's digest would say, without sending it.

    Worth being able to look before it goes to the whole list.
    """
    from app.services import daily_digest

    composed = daily_digest.compose(db)
    if composed is None:
        return {"would_send": False, "reason": "nothing new since the last digest"}
    subject, body, marks = composed
    return {"would_send": True, "subject": subject, "html": body, "marks": marks}


@router.post("/admin/digest/send", dependencies=[Depends(require_admin)])
async def digest_send(db: Session = Depends(get_db)) -> dict:
    """Send today's digest now rather than waiting for the worker.

    Still one per day: if it has already gone out today this reports that
    instead of mailing everybody twice.
    """
    from app.services import daily_digest

    return await daily_digest.run(db)
