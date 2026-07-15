"""Advertisements — admin-managed, shown on the storefront."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.advert import Advert


def _to_dict(a: Advert) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "advertiser": a.advertiser,
        "description": a.description,
        "image_url": a.image_url,
        "link_url": a.link_url,
        "placement": a.placement,
        "category": a.category,
        "active": a.active,
        "subscription_ends": a.subscription_ends.isoformat() if a.subscription_ends else None,
        "created_at": a.created_at,
    }


def list_adverts(db: Session, placement: str | None = None, include_inactive: bool = False) -> list[dict]:
    stmt = select(Advert).order_by(Advert.created_at.desc())
    if not include_inactive:
        stmt = stmt.where(Advert.active.is_(True))
    if placement:
        stmt = stmt.where(Advert.placement == placement)
    return [_to_dict(r) for r in db.execute(stmt).scalars().all()]


def create(db: Session, data: dict) -> Advert:
    row = Advert(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update(db: Session, advert_id: int, data: dict) -> Advert | None:
    row = db.get(Advert, advert_id)
    if not row:
        return None
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


def delete(db: Session, advert_id: int) -> bool:
    row = db.get(Advert, advert_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True
