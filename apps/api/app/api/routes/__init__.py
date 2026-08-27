from fastapi import APIRouter

from app.api.routes import (
    adverts,
    auth,
    campaigns,
    careers,
    contact,
    coupons,
    courses,
    health,
    jobs,
    orders,
    newsletter,
    push,
    payments,
    posts,
    products,
    referrals,
    stats,
    subscriptions,
    unlock_codes,
    uploads,
    vendor,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(vendor.router, prefix="/vendor", tags=["vendor"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["coupons"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["referrals"])
api_router.include_router(adverts.router, prefix="/adverts", tags=["adverts"])
api_router.include_router(careers.router, prefix="/careers", tags=["careers"])
api_router.include_router(unlock_codes.router, prefix="/unlock-codes", tags=["unlock-codes"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["newsletter"])
api_router.include_router(push.router, prefix="/push", tags=["push"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
