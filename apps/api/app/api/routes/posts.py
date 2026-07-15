from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.post import PostIn, PostOut
from app.services import posts as posts_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", response_model=list[PostOut])
def list_posts(type: str | None = None, db: Session = Depends(get_db)) -> list[dict]:
    """Public: published posts, optionally filtered by type ("blog" | "news")."""
    return posts_service.list_posts(db, post_type=type)


@router.get("/admin", response_model=list[PostOut], dependencies=[Depends(require_admin)])
def admin_list_posts(db: Session = Depends(get_db)) -> list[dict]:
    return posts_service.list_posts(db, include_unpublished=True)


@router.get("/{slug}", response_model=PostOut)
def get_post(slug: str, db: Session = Depends(get_db)) -> dict:
    post = posts_service.get_post(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostOut, status_code=201, dependencies=[Depends(require_admin)])
def create_post(payload: PostIn, db: Session = Depends(get_db)) -> PostOut:
    return posts_service.create(db, payload.model_dump())


@router.put("/{post_id}", response_model=PostOut, dependencies=[Depends(require_admin)])
def update_post(post_id: int, payload: PostIn, db: Session = Depends(get_db)) -> PostOut:
    post = posts_service.update(db, post_id, payload.model_dump())
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_post(post_id: int, db: Session = Depends(get_db)) -> None:
    if not posts_service.delete(db, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
