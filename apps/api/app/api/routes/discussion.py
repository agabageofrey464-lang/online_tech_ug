from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services import discussion

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _is_admin(x_admin_key: str) -> bool:
    return bool(settings.admin_api_key) and x_admin_key == settings.admin_api_key


class PostIn(BaseModel):
    course_slug: str = "general"
    title: str = ""
    body: str
    author_name: str = "Student"
    author_email: str = ""
    parent_id: int | None = None
    device_token: str = ""


class HideIn(BaseModel):
    hidden: bool = True


@router.get("")
def list_threads(
    course: str = Query(default="all"),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Public: discussion threads, newest first."""
    return discussion.list_threads(db, course, limit)


@router.get("/rooms")
def list_rooms(db: Session = Depends(get_db)) -> list[dict]:
    """Public: which course rooms have conversation in them."""
    return discussion.rooms(db)


@router.get("/{post_id}")
def get_thread(post_id: int, db: Session = Depends(get_db)) -> dict:
    thread = discussion.get_thread(db, post_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Discussion not found")
    return thread


@router.post("", status_code=201)
def create_post(
    payload: PostIn,
    x_admin_key: str = Header(default=""),
    db: Session = Depends(get_db),
) -> dict:
    """Public: ask a question or reply. Posts from the admin key are flagged as
    staff answers so students can see which reply is official."""
    try:
        return discussion.create_post(
            db,
            course_slug=payload.course_slug,
            title=payload.title,
            body=payload.body,
            author_name="Online Tech Uganda" if _is_admin(x_admin_key) else payload.author_name,
            author_email=payload.author_email,
            parent_id=payload.parent_id,
            device_token=payload.device_token,
            is_staff=_is_admin(x_admin_key),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{post_id}/like")
def like(post_id: int, db: Session = Depends(get_db)) -> dict:
    res = discussion.like_post(db, post_id)
    if not res:
        raise HTTPException(status_code=404, detail="Post not found")
    return res


@router.delete("/{post_id}")
def delete_own(
    post_id: int,
    device_token: str = Query(default=""),
    db: Session = Depends(get_db),
) -> dict:
    """A student deleting their own post, from the device that wrote it."""
    return {"ok": discussion.delete_own(db, post_id, device_token)}


# ── Admin moderation ────────────────────────────────────────────────────
@router.get("/admin/all", dependencies=[Depends(require_admin)])
def admin_all(db: Session = Depends(get_db)) -> list[dict]:
    return discussion.admin_list(db)


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)) -> dict:
    return discussion.stats(db)


@router.post("/admin/{post_id}/hide", dependencies=[Depends(require_admin)])
def admin_hide(post_id: int, payload: HideIn, db: Session = Depends(get_db)) -> dict:
    res = discussion.set_hidden(db, post_id, payload.hidden)
    if not res:
        raise HTTPException(status_code=404, detail="Post not found")
    return res
