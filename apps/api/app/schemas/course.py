from pydantic import BaseModel


class LessonOut(BaseModel):
    title: str
    minutes: int
    free: bool = False
    preview: str | None = None
    youtube: str | None = None


class MaterialOut(BaseModel):
    title: str
    file: str


class QuizQuestionOut(BaseModel):
    q: str
    options: list[str]
    answer: int


class CourseOut(BaseModel):
    id: int
    slug: str
    title: str
    level: str
    lessons: int
    hours: int
    price_ugx: int
    blurb: str
    emoji: str
    unlock_code: str = ""
    sample_video: str = ""
    syllabus: list[LessonOut] = []
    materials: list[MaterialOut] = []
    quiz: list[QuizQuestionOut] = []
