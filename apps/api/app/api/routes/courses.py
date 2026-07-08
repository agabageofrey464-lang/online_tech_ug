from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.course import CourseOut
from app.services import courses

router = APIRouter()


@router.get("", response_model=list[CourseOut])
def get_courses(db: Session = Depends(get_db)) -> list[dict]:
    """List courses (DB-backed, with seed fallback)."""
    return courses.list_courses(db)


@router.get("/{slug}", response_model=CourseOut)
def get_course(slug: str, db: Session = Depends(get_db)) -> dict:
    course = courses.get_course(db, slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
