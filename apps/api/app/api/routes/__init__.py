from fastapi import APIRouter

from app.api.routes import contact, courses, health, orders, products, unlock_codes

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(unlock_codes.router, prefix="/unlock-codes", tags=["unlock-codes"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
