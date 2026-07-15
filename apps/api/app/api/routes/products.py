from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductOut
from app.services import catalog

router = APIRouter()


class StockUpdate(BaseModel):
    stock_qty: int
    in_stock: bool | None = None


def require_admin(x_admin_key: str = Header(default="")) -> None:
    """Guard write operations with a shared admin key."""
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", response_model=list[ProductOut])
def get_products(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    sort: str = Query(default="popular", pattern="^(popular|price-asc|price-desc)$"),
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[dict]:
    """List products (DB-backed, with seed fallback)."""
    return catalog.list_products(
        db, category=category, search=search, sort=sort, limit=limit, offset=offset
    )


@router.post(
    "", response_model=ProductOut, status_code=201, dependencies=[Depends(require_admin)]
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> dict:
    data = payload.model_dump()
    # specs arrives as a dict; store None when all fields are empty
    if data.get("specs") and not any((data["specs"] or {}).values()):
        data["specs"] = None
    try:
        return catalog.create_product(db, data)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.get("/admin/inventory", dependencies=[Depends(require_admin)])
def inventory(db: Session = Depends(get_db)) -> list[dict]:
    """Admin: all products with stock levels, lowest first."""
    return catalog.list_inventory(db)


@router.patch("/{slug}/stock", dependencies=[Depends(require_admin)])
def update_stock(slug: str, payload: StockUpdate, db: Session = Depends(get_db)) -> dict:
    updated = catalog.update_stock(db, slug, payload.stock_qty, payload.in_stock)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)) -> dict:
    product = catalog.get_product(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
