"""Populate the database with the Phase 1 seed catalog.

Run from apps/api:  python -m scripts.seed
"""

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.product import Product
from app.services.catalog import SEED_PRODUCTS


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        added = 0
        for data in SEED_PRODUCTS:
            exists = db.query(Product).filter_by(slug=data["slug"]).first()
            if exists:
                continue
            db.add(Product(**data))
            added += 1
        db.commit()
        print(f"Seed complete. Added {added} new product(s).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
