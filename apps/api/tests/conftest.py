"""Test setup: the real app, on a throwaway in-memory database.

Nothing here touches PostgreSQL, the network or the uploads folder. Each test
gets a fresh database and fresh rate-limit counters, so tests cannot affect one
another whatever order they run in.
"""

import os

os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401  (registers every table)
from app.core import ratelimit
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.order import Order, OrderItem

ADMIN = {"X-Admin-Key": "test-admin-key"}


@pytest.fixture()
def db_factory(tmp_path):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine)

    def _get_db():
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db
    settings.admin_api_key = ADMIN["X-Admin-Key"]
    settings.upload_dir = str(tmp_path)
    ratelimit._hits.clear()
    yield factory
    app.dependency_overrides.clear()


@pytest.fixture()
def client(db_factory):
    # No `with`: the app's start-up work (catalogue sync, the campaign worker)
    # is not what these tests are about and must not run against the network.
    return TestClient(app)


@pytest.fixture()
def order(db_factory):
    """One real-looking order with a single product on it."""
    with db_factory() as db:
        o = Order(
            reference="OTU-TEST0001",
            customer_name="Test Customer",
            phone="0700000000",
            email="customer@example.com",
            delivery_town="Kampala",
            delivery_address="Plot 1, Test Road",
            notes="ring the bell",
            subtotal=100_000,
            delivery_fee=10_000,
            total=110_000,
            payment_method="pay_at_shop",
            payment_status="unpaid",
            status="delivered",
        )
        db.add(o)
        db.flush()
        db.add(OrderItem(order_id=o.id, product_slug="test-laptop", name="Test Laptop", unit_price=100_000, quantity=1, line_total=100_000))
        db.commit()
    return "OTU-TEST0001"
