from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.careers import FreelancerIn, FreelancerPatch, StatusIn
from app.services import careers, notify

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


# --- Public: apply to a job (with optional CV upload) ---
@router.post("/apply", status_code=201)
async def apply(
    name: str = Form(...),
    email: str = Form(""),
    phone: str = Form(""),
    message: str = Form(""),
    job_id: int | None = Form(None),
    job_title: str = Form(""),
    cv: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> dict:
    stored = ""
    if cv is not None and cv.filename:
        content = await cv.read()
        try:
            stored = careers.save_cv(cv.filename, content)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    app = careers.create_application(
        db,
        {
            "name": name, "email": email, "phone": phone, "message": message,
            "job_id": job_id, "job_title": job_title, "cv_filename": stored,
        },
    )

    # Until now an application reached nobody — it sat in the database waiting
    # to be noticed. Tell the owner on both channels.
    await notify.alert_owner(
        icon="💼",
        title="New job application",
        reference=f"OTU-A{app.id:05d}",
        pairs=[
            ("Role", job_title or "General application"),
            ("Name", name),
            ("Phone", phone),
            ("Email", email),
            ("CV", "attached" if stored else "none"),
        ],
        note=message,
        where="Admin › Applications",
        db=db,
        url="/applications",
        reply_to=email or None,
    )
    return {"id": app.id, "ok": True}


# --- Public: freelancers directory ---
@router.get("/freelancers")
def freelancers(db: Session = Depends(get_db)) -> list[dict]:
    return careers.list_freelancers(db)


@router.post("/freelancers", status_code=201)
async def join_freelancers(payload: FreelancerIn, db: Session = Depends(get_db)) -> dict:
    """Public self-signup — listed after admin approval."""
    data = payload.model_dump()
    f = careers.create_freelancer(db, data, approved=False)
    await notify.alert_owner(
        icon="🧑",
        title="New freelancer signup",
        reference=f"OTU-F{f.id:05d}",
        pairs=[
            ("Name", data.get("name", "")),
            ("Title", data.get("title", "")),
            ("Skills", data.get("skills", "")),
            ("Rate", data.get("rate", "")),
            ("Location", data.get("location", "")),
            ("Phone", data.get("phone", "")),
            ("Email", data.get("email", "")),
        ],
        note=data.get("bio", ""),
        where="Admin › Freelancers — approve to list them",
        db=db,
        url="/freelancers",
        reply_to=data.get("email") or None,
    )
    return {"id": f.id, "ok": True}


@router.post("/freelancers/{freelancer_id}/contact", status_code=202)
async def freelancer_contacted(
    freelancer_id: int, channel: str = "whatsapp", db: Session = Depends(get_db)
) -> dict:
    """A visitor is being handed off to this freelancer — record it and tell the owner.

    The directory's buttons open WhatsApp, the dialler or a mail client
    directly, so until now nobody knew whether anyone ever pressed them. A
    freelancer could be paying for a listing that had never been clicked.

    This is fired as the visitor leaves, so it must stay cheap and must never
    be able to hold the hand-off up: an unknown id or a bad channel is answered
    202 like everything else rather than raising, because there is no user left
    on the page to show an error to.
    """
    row = careers.record_contact(db, freelancer_id, channel)
    if row is None:
        return {"ok": False}

    await notify.alert_owner(
        icon="📩",
        title=f"Someone contacted {row.name}",
        reference=f"OTU-FC{freelancer_id:05d}",
        pairs=[
            ("Freelancer", row.name),
            ("Title", row.title or ""),
            ("Channel", channel.title()),
            ("Their phone", row.phone or ""),
            ("Their email", row.email or ""),
        ],
        note="A visitor opened this freelancer's contact from the directory. "
        "The conversation itself goes straight to them, not through us.",
        where="Admin › Freelancers",
        db=db,
        url="/freelancers",
    )
    return {"ok": True}


# --- Admin: applications inbox ---
@router.get("/applications", dependencies=[Depends(require_admin)])
def list_applications(db: Session = Depends(get_db)) -> list[dict]:
    return careers.list_applications(db)


@router.get("/applications/{application_id}/cv", dependencies=[Depends(require_admin)])
def download_cv(application_id: int, db: Session = Depends(get_db)):
    app = careers.get_application(db, application_id)
    if not app or not app.cv_filename:
        raise HTTPException(status_code=404, detail="No CV on file")
    path = careers.cv_path(app.cv_filename)
    if not path:
        raise HTTPException(status_code=404, detail="CV file missing")
    return FileResponse(path, filename=app.cv_filename.split("_", 1)[-1])


@router.patch("/applications/{application_id}", dependencies=[Depends(require_admin)])
def update_application(application_id: int, payload: StatusIn, db: Session = Depends(get_db)) -> dict:
    if not careers.set_application_status(db, application_id, payload.status):
        raise HTTPException(status_code=404, detail="Application not found")
    return {"id": application_id, "status": payload.status}


# --- Admin: freelancers moderation ---
@router.get("/admin/freelancers", dependencies=[Depends(require_admin)])
def admin_freelancers(db: Session = Depends(get_db)) -> list[dict]:
    # Carry how many times each has been contacted, so the admin can see which
    # listings actually earn their place and which have never been clicked.
    counts = careers.contact_counts(db)
    rows = careers.list_freelancers(db, include_unapproved=True)
    for r in rows:
        r["contacts"] = counts.get(r["id"], 0)
    return rows


@router.post("/admin/freelancers", status_code=201, dependencies=[Depends(require_admin)])
def admin_add_freelancer(payload: FreelancerIn, db: Session = Depends(get_db)) -> dict:
    f = careers.create_freelancer(db, payload.model_dump(), approved=True)
    return {"id": f.id, "ok": True}


@router.patch("/admin/freelancers/{freelancer_id}", dependencies=[Depends(require_admin)])
def admin_update_freelancer(
    freelancer_id: int, payload: FreelancerPatch, db: Session = Depends(get_db)
) -> dict:
    """Correct a freelancer's details.

    There was no way to edit one: create, approve and delete were the whole
    set. So fixing a typo, a changed phone number or a photo URL that had gone
    404 meant deleting the person and adding them again — which loses their id,
    their place in the directory and their paid subscription date.
    """
    changes = payload.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    row = careers.update_freelancer(db, freelancer_id, changes)
    if row is None:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return {"id": row.id, "ok": True, "updated": sorted(changes)}


@router.post("/admin/freelancers/{freelancer_id}/approve", dependencies=[Depends(require_admin)])
def admin_approve_freelancer(freelancer_id: int, approved: bool = True, db: Session = Depends(get_db)) -> dict:
    if not careers.set_freelancer_approved(db, freelancer_id, approved):
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return {"id": freelancer_id, "approved": approved}


@router.delete("/admin/freelancers/{freelancer_id}", status_code=204, dependencies=[Depends(require_admin)])
def admin_delete_freelancer(freelancer_id: int, db: Session = Depends(get_db)) -> None:
    if not careers.delete_freelancer(db, freelancer_id):
        raise HTTPException(status_code=404, detail="Freelancer not found")
