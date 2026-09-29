from pydantic import BaseModel, Field


class FreelancerIn(BaseModel):
    """A freelancer's directory entry.

    Every bounded field carries the length of the column it is written to. Only
    ``name`` did, so anything longer than its column reached the database and
    came back as a 500 with nothing the person could act on — the form told a
    freelancer with a 952-character skills list to "try again", which would
    have failed identically every time. With the limits stated here the API
    answers 422 and names the field that is too long.

    ``skills`` and ``bio`` are stored as text. The caps on them are an upper
    bound on abuse, not an editorial judgement about how much someone may say.
    """

    name: str = Field(min_length=2, max_length=160)
    title: str = Field(default="", max_length=160)
    skills: str = Field(default="", max_length=4000)  # comma separated
    bio: str = Field(default="", max_length=8000)
    rate: str = Field(default="", max_length=80)
    location: str = Field(default="Uganda", max_length=120)
    phone: str = Field(default="", max_length=40)
    email: str = Field(default="", max_length=200)
    portfolio_url: str = Field(default="", max_length=500)
    image_url: str = Field(default="", max_length=500)


class StatusIn(BaseModel):
    status: str


class FreelancerPatch(BaseModel):
    """A change to one freelancer, field by field.

    Every field is optional and ``None`` means "leave this alone", so a caller
    can correct one thing without resending — and risking overwriting — the
    rest of someone's profile. The lengths match FreelancerIn.
    """

    name: str | None = Field(default=None, min_length=2, max_length=160)
    title: str | None = Field(default=None, max_length=160)
    skills: str | None = Field(default=None, max_length=4000)
    bio: str | None = Field(default=None, max_length=8000)
    rate: str | None = Field(default=None, max_length=80)
    location: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=200)
    portfolio_url: str | None = Field(default=None, max_length=500)
    image_url: str | None = Field(default=None, max_length=500)
