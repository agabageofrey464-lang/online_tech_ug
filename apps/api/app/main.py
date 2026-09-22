import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import __version__
from app.api.routes import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Ensure models are registered with Base.metadata
from app import models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("onlinetech")



async def _campaign_worker() -> None:
    """Every hour: refresh the storefront campaign banner, and — at most twice a
    day, spaced apart — announce one campaign by email and push.

    The banner changing hourly keeps the shop looking alive; the announcement cap
    is what stops that becoming spam in a customer's inbox or on their phone.
    """
    from datetime import datetime

    from app.db.session import SessionLocal
    from app.services import campaign_auto, newsletter, push

    while True:
        try:
            with SessionLocal() as db:
                campaign_auto.refresh_auto_campaigns(db)

                due = campaign_auto.due_for_announcement(db)
                if due is not None:
                    title, body = campaign_auto.push_copy_for(due)
                    link = due.link_url or "/shop"

                    if push.configured():
                        try:
                            await push.broadcast(db, title, body, link)
                        except Exception as exc:  # noqa: BLE001
                            logger.warning("Campaign push failed: %s", exc)
                    # Automatic marketing EMAIL is off — it was too much mail for
                    # customers. Campaigns now reach people by push only, and the
                    # owner sends an email deliberately from Admin > Notifications
                    # when there is something worth saying. Set
                    # CAMPAIGN_AUTO_EMAIL=true to turn the daily send back on.
                    if settings.campaign_auto_email and campaign_auto.should_email(db):
                        try:
                            subject = "New arrivals at Online Tech Uganda"
                            html = (
                                "<p>Here is what's new in the shop today.</p>"
                                f"<p><b>{due.title}</b></p>"
                                f"<p>{due.pill or ''}</p>"
                                f"<p>{due.note or ''}</p>"
                            )
                            await newsletter.broadcast(db, subject, html, include_customers=True)
                            due.emailed_at = datetime.utcnow()
                        except Exception as exc:  # noqa: BLE001
                            logger.warning("Campaign email failed: %s", exc)

                    due.notified_at = datetime.utcnow()
                    db.commit()
                    logger.info("Announced campaign: %s", due.title)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Campaign worker cycle failed: %s", exc)

        await asyncio.sleep(3600)  # once an hour


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Best-effort DB bootstrap. The API still starts if the DB is unreachable so
    # the storefront (seed catalog) keeps working during local development.
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
        logger.info("Database connected and tables ensured.")
        # Seed courses into the DB if the table is empty (idempotent).
        try:
            from app.db.session import SessionLocal
            from app.services.courses import seed_courses

            with SessionLocal() as db:
                added = seed_courses(db)
                if added:
                    logger.info("Seeded %d courses into the database.", added)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Course seeding skipped (%s).", exc)
        # Seed job postings into the DB if the table is empty (idempotent).
        try:
            from app.db.session import SessionLocal
            from app.services.jobs import seed_jobs

            with SessionLocal() as db:
                added = seed_jobs(db)
                if added:
                    logger.info("Seeded %d jobs into the database.", added)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Job seeding skipped (%s).", exc)
        # Seed blog / tech-news posts if the table is empty (idempotent).
        try:
            from app.db.session import SessionLocal
            from app.services.posts import seed_posts

            with SessionLocal() as db:
                added = seed_posts(db)
                if added:
                    logger.info("Seeded %d posts into the database.", added)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Post seeding skipped (%s).", exc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Database unavailable at startup (%s). Running in degraded mode.", exc)

    # Hourly campaign refresh + rationed announcements.
    task = asyncio.create_task(_campaign_worker())
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(
    title=settings.app_name,
    version=__version__,
    description="Backend for Online Tech Uganda — shop, services, learning & support.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": __version__,
        "docs": "/docs",
        "health": f"{settings.api_v1_prefix}/health",
    }
