"""Customer / vendor account service."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create_user(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    phone: str = "",
    role: str = "customer",
    business_name: str = "",
) -> User:
    """Create an account. Raises ValueError if the email is already registered."""
    if get_by_email(db, email):
        raise ValueError("An account with this email already exists")
    user = User(
        name=name.strip(),
        email=email.lower().strip(),
        phone=phone.strip(),
        password_hash=hash_password(password),
        role=role,
        business_name=business_name.strip(),
        # Vendors start unapproved (admin reviews); customers are active immediately.
        vendor_approved=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = get_by_email(db, email)
    if not user or not user.is_active or not verify_password(password, user.password_hash):
        return None
    return user
