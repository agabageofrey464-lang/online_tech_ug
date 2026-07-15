"""Image uploads — admin uploads a photo, it's served publicly for display."""

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.config import settings
from app.services import storage

router = APIRouter()

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)) -> dict:
    """Admin: upload an image. Returns its stored path (e.g. 'images/ab12_pic.jpg')."""
    content = await file.read()
    try:
        stored = storage.save_file(
            "images", file.filename or "image", content, allowed=IMAGE_EXT, max_bytes=MAX_IMAGE_BYTES
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"path": f"images/{stored}"}


@router.get("/images/{stored}")
def serve_image(stored: str):
    """Public: serve an uploaded image so it displays on the storefront."""
    path = storage.file_path("images", stored)
    if not path:
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)
