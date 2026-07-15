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


def file_path(subdir: str, stored: str) -> Path | None:
    p = _dir(subdir) / stored
    return p if p.exists() else None
