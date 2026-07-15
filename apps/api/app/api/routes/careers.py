from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.careers import FreelancerIn, StatusIn
from app.services import careers

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
    return {"id": app.id, "ok": True}


# --- Public: freelancers directory ---
@router.get("/freelancers")
def freelancers(db: Session = Depends(get_db)) -> list[dict]:
    return careers.list_freelancers(db)


@router.post("/freelancers", status_code=201)
def join_freelancers(payload: FreelancerIn, db: Session = Depends(get_db)) -> dict:
    """Public self-signup — listed after admin approval."""
    f = careers.create_freelancer(db, payload.model_dump(), approved=False)
    return {"id": f.id, "ok": True}


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
    return careers.list_freelancers(db, include_unapproved=True)


@router.post("/admin/freelancers", status_code=201, dependencies=[Depends(require_admin)])
def admin_add_freelancer(payload: FreelancerIn, db: Session = Depends(get_db)) -> dict:
    f = careers.create_freelancer(db, payload.model_dump(), approved=True)
    return {"id": f.id, "ok": True}


@router.post("/admin/freelancers/{freelancer_id}/approve", dependencies=[Depends(require_admin)])
def admin_approve_freelancer(freelancer_id: int, approved: bool = True, db: Session = Depends(get_db)) -> dict:
    if not careers.set_freelancer_approved(db, freelancer_id, approved):
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return {"id": freelancer_id, "approved": approved}


@router.delete("/admin/freelancers/{freelancer_id}", status_code=204, dependencies=[Depends(require_admin)])
def admin_delete_freelancer(freelancer_id: int, db: Session = Depends(get_db)) -> None:
    if not careers.delete_freelancer(db, freelancer_id):
        raise HTTPException(status_code=404, detail="Freelancer not found")
