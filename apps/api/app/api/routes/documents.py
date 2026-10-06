"""Issued documents — letters and the like, kept privately for the admin.

Nothing here is public. The admin generates a letter in the browser, and a
copy is sent here so it can be found again; before this the only copy was
wherever the browser saved it, which is how a student's acceptance letter came
to be sitting in the storefront's public folder.
"""

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document
from app.services import storage

router = APIRouter()

SUBDIR = "documents"
DOC_EXT = {".pdf"}


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _out(d: Document) -> dict:
    return {
        "id": d.id,
        "kind": d.kind,
        "title": d.title,
        "reference": d.reference,
        "filename": d.filename,
        "size": d.size,
        "created_at": d.created_at,
    }


@router.post("", dependencies=[Depends(require_admin)], status_code=201)
async def add_document(
    file: UploadFile = File(...),
    kind: str = Form(...),
    title: str = Form(default=""),
    reference: str = Form(default=""),
    db: Session = Depends(get_db),
) -> dict:
    """Admin: keep a copy of a document that has just been issued."""
    content = await file.read()
    try:
        stored = storage.save_file(SUBDIR, file.filename or "document.pdf", content, allowed=DOC_EXT)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    doc = Document(
        kind=kind.strip()[:40],
        title=title.strip()[:200],
        reference=reference.strip()[:60],
        filename=(file.filename or "document.pdf")[:160],
        stored=stored,
        size=len(content),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _out(doc)


@router.get("", dependencies=[Depends(require_admin)])
def list_documents(kind: str = "", db: Session = Depends(get_db)) -> list[dict]:
    """Admin: issued documents, newest first. `kind` matches by prefix, so
    "internship" returns both acceptance and completion letters."""
    q = select(Document).order_by(Document.created_at.desc(), Document.id.desc())
    if kind:
        q = q.where(Document.kind.startswith(kind))
    return [_out(d) for d in db.scalars(q).all()]


@router.get("/{document_id}/file", dependencies=[Depends(require_admin)])
def download_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    path = storage.file_path(SUBDIR, doc.stored) if doc else None
    if not doc or not path:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(path, media_type="application/pdf", filename=doc.filename)


@router.delete("/{document_id}", dependencies=[Depends(require_admin)])
def delete_document(document_id: int, db: Session = Depends(get_db)) -> dict:
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = storage.file_path(SUBDIR, doc.stored)
    if path:
        path.unlink()
    db.delete(doc)
    db.commit()
    return {"ok": True}
