from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services import campaigns

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


class CampaignIn(BaseModel):
    title: str
    slug: str | None = None
    program: str = ""
    badge: str = ""
    badge_sub: str = ""
    pill: str = ""
    note: str = ""
    small: str = "T&Cs Apply"
    cta_label: str = "Shop now"
    link_url: str = "/shop"
    image_url: str = ""
    bg_color: str = "#6d28d9"
    panel_color: str = "#FCDC04"
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    active: bool = True
    priority: int = 0
    placement: str = "home"
    discount_pct: int = 0


class CampaignPatch(BaseModel):
    title: str | None = None
    program: str | None = None
    badge: str | None = None
    badge_sub: str | None = None
    pill: str | None = None
    note: str | None = None
    small: str | None = None
    cta_label: str | None = None
    link_url: str | None = None
    image_url: str | None = None
    bg_color: str | None = None
    panel_color: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    active: bool | None = None
    priority: int | None = None
    placement: str | None = None
    discount_pct: int | None = None


@router.get("")
def public_campaigns(
    placement: str | None = Query(default=None), db: Session = Depends(get_db)
) -> list[dict]:
    """Public: campaigns that are live right now (active + inside their dates)."""
    return campaigns.live_campaigns(db, placement)


@router.post("/{slug}/click")
def click(slug: str, db: Session = Depends(get_db)) -> dict:
    """Public: count a click so the owner can see which campaigns work."""
    return {"ok": campaigns.record_click(db, slug)}


@router.get("/admin/all", dependencies=[Depends(require_admin)])
def admin_all(db: Session = Depends(get_db)) -> list[dict]:
    return campaigns.list_campaigns(db)


@router.post("/admin", status_code=201, dependencies=[Depends(require_admin)])
def admin_create(payload: CampaignIn, db: Session = Depends(get_db)) -> dict:
    try:
        return campaigns.create(db, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/admin/{campaign_id}", dependencies=[Depends(require_admin)])
def admin_update(campaign_id: int, payload: CampaignPatch, db: Session = Depends(get_db)) -> dict:
    row = campaigns.update(db, campaign_id, payload.model_dump(exclude_unset=True))
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return row


@router.delete("/admin/{campaign_id}", status_code=204, dependencies=[Depends(require_admin)])
def admin_delete(campaign_id: int, db: Session = Depends(get_db)) -> None:
    if not campaigns.delete(db, campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
