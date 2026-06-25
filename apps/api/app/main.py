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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Best-effort DB bootstrap. The API still starts if the DB is unreachable so
    # the storefront (seed catalog) keeps working during local development.
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
        logger.info("Database connected and tables ensured.")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Database unavailable at startup (%s). Running in degraded mode.", exc)
    yield


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
