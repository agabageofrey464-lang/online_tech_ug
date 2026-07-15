from pydantic import BaseModel, Field


class FreelancerIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    title: str = ""
    skills: str = ""  # comma separated
    bio: str = ""
    rate: str = ""
    location: str = "Uganda"
    phone: str = ""
    email: str = ""
    portfolio_url: str = ""
    image_url: str = ""


class StatusIn(BaseModel):
    status: str
