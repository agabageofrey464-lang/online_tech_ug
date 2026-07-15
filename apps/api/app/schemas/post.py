from datetime import datetime

from pydantic import BaseModel


class PostIn(BaseModel):
    title: str
    type: str = "blog"  # "blog" | "news"
    category: str = "Technology News"
    excerpt: str = ""
    body: str = ""
    image_url: str = ""
    author: str = "Online Tech Uganda"
    published: bool = True


class PostOut(PostIn):
    id: int
    slug: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True
