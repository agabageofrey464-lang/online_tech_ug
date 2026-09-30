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
    from app.services import campaign_auto, catalog_sync, daily_digest, newsletter, push

    while True:
        try:
            with SessionLocal() as db:
                # Catches up with anything published to the shop since the
                # last pass, so the two can't drift between restarts.
                try:
                    await catalog_sync.sync(db)
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Catalog sync failed: %s", exc)

                # Registration is validated against the courses table, so it
                # has to know about a course before anyone can enrol on it.
                try:
                    await catalog_sync.sync_courses(db)
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Course sync failed: %s", exc)

                # The daily "what's new" digest. Checked every hour but it
                # writes one row per day, so a restart cannot send twice, and
                # it stays quiet on a day with no news.
                if datetime.utcnow().hour >= settings.daily_digest_hour:
                    try:
                        outcome = await daily_digest.run(db)
                        if outcome.get("sent"):
                            logger.info("Daily digest: %s", outcome)
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("Daily digest failed: %s", exc)

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
                            await newsletter.broadcast(db, subject, html, include_customers=False)
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
        # create_all() never alters a table that already exists, so a column
        # declared too narrow stays too narrow on every deployed database.
        try:
            from app.db.schema_fixes import apply_widenings

            widened = apply_widenings(engine)
            if widened:
                logger.info("Widened %d column(s) to match the models.", widened)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Schema widening skipped (%s).", exc)
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
        # Pull the shop front's catalogue so the prices we charge match the
        # prices customers are shown, and every product on sale can be ordered.
        try:
            from app.db.session import SessionLocal
            from app.services import catalog_sync

            with SessionLocal() as db:
                result = await catalog_sync.sync(db)
                logger.info("Catalog sync at startup: %s", result)
                result = await catalog_sync.sync_courses(db)
                logger.info("Course sync at startup: %s", result)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Catalog sync skipped (%s).", exc)
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
