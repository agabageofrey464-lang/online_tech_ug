"""Generic file storage for uploaded documents (CVs, ID/verification docs)."""

import os
import re
import secrets
from pathlib import Path

from app.core.config import settings

IMAGE_DOC_EXT = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx"}
MAX_DOC_BYTES = 8 * 1024 * 1024  # 8 MB


def _dir(subdir: str) -> Path:
    d = Path(settings.upload_dir) / subdir
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_file(subdir: str, filename: str, content: bytes, allowed=IMAGE_DOC_EXT, max_bytes=MAX_DOC_BYTES) -> str:
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in allowed:
        raise ValueError(f"Allowed file types: {', '.join(sorted(allowed))}")
    if len(content) > max_bytes:
        raise ValueError(f"File must be under {max_bytes // (1024 * 1024)} MB")
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename or "file"))[:60]
    stored = f"{secrets.token_hex(6)}_{safe}"
    (_dir(subdir) / stored).write_bytes(content)
    return stored


PHOTO_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".jfif"}
# What the web server in front of us lets through; a phone's camera picture fits.
MAX_PHOTO_BYTES = 19 * 1024 * 1024


def save_photo(filename: str, content: bytes) -> str:
    """Save a product photograph, standardised so it looks the same from any device.

    Whatever arrives — a phone's camera picture, a small image saved from a
    website, a PNG — is stored as an upright JPEG on a white square of one size.
    """
    from app.services import product_photo

    ext = os.path.splitext(filename or "")[1].lower()
    if ext and ext not in PHOTO_EXT:
        raise ValueError("Please upload a photo: JPG, PNG or WebP.")
    if len(content) > MAX_PHOTO_BYTES:
        raise ValueError(f"Photo must be under {MAX_PHOTO_BYTES // (1024 * 1024)} MB")
    data = product_photo.standardise(content)  # raises ValueError if it is not a picture
    stem = re.sub(r"[^a-zA-Z0-9_-]", "_", os.path.splitext(os.path.basename(filename or "photo"))[0])[:50] or "photo"
    stored = f"{secrets.token_hex(6)}_{stem}.jpg"
    (_dir("images") / stored).write_bytes(data)
    return stored


def file_path(subdir: str, stored: str) -> Path | None:
    p = _dir(subdir) / stored
    return p if p.exists() else None
