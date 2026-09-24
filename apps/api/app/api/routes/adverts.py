from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.advert import AdvertIn, AdvertOut
from app.services import adverts as adverts_service
from app.services import notify

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", response_model=list[AdvertOut])
def list_adverts(placement: str | None = None, db: Session = Depends(get_db)) -> list[dict]:
    """Public: active adverts, optionally filtered by placement."""
    return adverts_service.list_adverts(db, placement=placement)


@router.get("/admin", response_model=list[AdvertOut], dependencies=[Depends(require_admin)])
def admin_list(db: Session = Depends(get_db)) -> list[dict]:
    return adverts_service.list_adverts(db, include_inactive=True)


@router.post("/submit", response_model=AdvertOut, status_code=201)
async def submit_advert(payload: AdvertIn, db: Session = Depends(get_db)) -> AdvertOut:
    """Public: an advertiser submits an advert. It stays inactive (pending) and
    is hidden from the site until an admin approves (activates) it."""
    data = payload.model_dump()
    data["active"] = False  # never auto-publish — pending admin review
    data["placement"] = "home"
    row = adverts_service.create(db, data)

    # It is hidden until approved, so nobody sees it until the owner looks.
    await notify.alert_owner(
        icon="📢",
        title="New advert submitted",
        reference=f"OTU-D{row.id:05d}",
        pairs=[
            ("Advert", data.get("title", "")),
            ("Advertiser", data.get("advertiser", "")),
            ("Category", data.get("category", "")),
            ("Links to", data.get("link_url", "")),
        ],
        note=data.get("description", ""),
        where="Admin › Adverts — approve to publish it",
    )
    return row


@router.post("", response_model=AdvertOut, status_code=201, dependencies=[Depends(require_admin)])
def create_advert(payload: AdvertIn, db: Session = Depends(get_db)) -> AdvertOut:
    return adverts_service.create(db, payload.model_dump())


@router.put("/{advert_id}", response_model=AdvertOut, dependencies=[Depends(require_admin)])
def update_advert(advert_id: int, payload: AdvertIn, db: Session = Depends(get_db)) -> AdvertOut:
    row = adverts_service.update(db, advert_id, payload.model_dump())
    if not row:
        raise HTTPException(status_code=404, detail="Advert not found")
    return row


@router.delete("/{advert_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_advert(advert_id: int, db: Session = Depends(get_db)) -> None:
    if not adverts_service.delete(db, advert_id):
        raise HTTPException(status_code=404, detail="Advert not found")
