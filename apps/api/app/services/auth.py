"""Customer / vendor account service."""

import secrets
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.password_reset import PasswordReset
from app.models.user import User

# How long an emailed code (verification or 2FA login OTP) stays valid.
CODE_TTL = timedelta(minutes=20)


def _new_code() -> str:
    """A 6-digit numeric code, zero-padded."""
    return f"{secrets.randbelow(1_000_000):06d}"


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
    business_category: str = "",
    location: str = "",
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
        business_category=business_category.strip(),
        location=location.strip(),
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


# --- Email verification -------------------------------------------------

def issue_verification_code(db: Session, user: User) -> str:
    """Generate & store a fresh email-verification code. Returns the code to email."""
    code = _new_code()
    user.verify_code = code
    user.verify_sent_at = datetime.utcnow()
    db.commit()
    return code


def confirm_email(db: Session, user: User, code: str) -> bool:
    """Verify the emailed code. On success mark the email verified and clear the code."""
    if user.email_verified:
        return True
    if not user.verify_code or not user.verify_sent_at:
        return False
    if datetime.utcnow() - user.verify_sent_at > CODE_TTL:
        return False
    if not secrets.compare_digest(user.verify_code, code.strip()):
        return False
    user.email_verified = True
    user.verify_code = ""
    db.commit()
    return True


# --- Two-factor (email OTP on login) ------------------------------------

def issue_twofa_code(db: Session, user: User) -> str:
    """Generate & store a fresh login OTP. Returns the code to email."""
    code = _new_code()
    user.twofa_code = code
    user.twofa_sent_at = datetime.utcnow()
    db.commit()
    return code


def check_twofa_code(db: Session, user: User, code: str) -> bool:
    if not user.twofa_code or not user.twofa_sent_at:
        return False
    if datetime.utcnow() - user.twofa_sent_at > CODE_TTL:
        return False
    if not secrets.compare_digest(user.twofa_code, code.strip()):
        return False
    user.twofa_code = ""
    db.commit()
    return True


def set_twofa(db: Session, user: User, enabled: bool) -> None:
    user.twofa_enabled = enabled
    user.twofa_code = ""
    db.commit()


# --- Password reset (emailed code) ---------------------------------------

def issue_reset_code(db: Session, user: User) -> str:
    """Start a reset: retire any earlier codes and store a fresh one to email."""
    for old in db.scalars(select(PasswordReset).where(PasswordReset.user_id == user.id, PasswordReset.used.is_(False))):
        old.used = True
    code = _new_code()
    db.add(PasswordReset(user_id=user.id, code=code))
    db.commit()
    return code


def reset_password(db: Session, user: User, code: str, new_password: str) -> bool:
    """Set a new password if `code` is this user's live reset code. One use."""
    row = db.scalar(
        select(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.used.is_(False))
        .order_by(PasswordReset.created_at.desc())
    )
    if not row or datetime.utcnow() - row.created_at > CODE_TTL:
        return False
    if not secrets.compare_digest(row.code, code.strip()):
        return False
    row.used = True
    user.password_hash = hash_password(new_password)
    # Whoever asked for this controls the mailbox, which is what verifying an
    # email proves; and a pending login code from before the reset is void.
    user.email_verified = True
    user.twofa_code = ""
    db.commit()
    return True
