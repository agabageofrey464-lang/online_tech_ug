from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Document(Base):
    """A document the business has issued and needs to keep — an internship
    acceptance or completion letter, to begin with.

    The file itself is on disk under uploads/documents, which no public route
    serves; this row is how the admin finds it again. They carry a student's
    name, institution and registration number, so they are read only with the
    admin key.
    """

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # What sort of document: "internship-acceptance", "internship-completion", …
    kind: Mapped[str] = mapped_column(String(40), index=True)
    # Who or what it is for, as the admin would search for it.
    title: Mapped[str] = mapped_column(String(200), default="")
    # The reference printed on the document, when it has one.
    reference: Mapped[str] = mapped_column(String(60), default="")
    filename: Mapped[str] = mapped_column(String(160))  # name offered on download
    stored: Mapped[str] = mapped_column(String(200))  # name on disk
    size: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
