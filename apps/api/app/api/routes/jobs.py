from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.job import JobIn, JobOut
from app.services import jobs as jobs_service

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db)) -> list[dict]:
    """Public: open job / internship postings."""
    return jobs_service.list_jobs(db)


@router.get("/admin", response_model=list[JobOut], dependencies=[Depends(require_admin)])
def admin_list_jobs(db: Session = Depends(get_db)) -> list[dict]:
    """Admin: all postings including closed ones."""
    return jobs_service.list_jobs(db, include_closed=True)


@router.post("", response_model=JobOut, status_code=201, dependencies=[Depends(require_admin)])
def create_job(payload: JobIn, db: Session = Depends(get_db)) -> JobOut:
    return jobs_service.create_job(db, payload.model_dump())


@router.put("/{job_id}", response_model=JobOut, dependencies=[Depends(require_admin)])
def update_job(job_id: int, payload: JobIn, db: Session = Depends(get_db)) -> JobOut:
    job = jobs_service.update_job(db, job_id, payload.model_dump())
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_job(job_id: int, db: Session = Depends(get_db)) -> None:
    if not jobs_service.delete_job(db, job_id):
        raise HTTPException(status_code=404, detail="Job not found")
