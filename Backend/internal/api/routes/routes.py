from fastapi import APIRouter

from internal.api.routes import inventory_router, maintenance_router, section_router, user_router, \
    notification_subscription_router, inventory_item_router, report_router, backup_router, health_router

api_router = APIRouter()
api_router.include_router(inventory_router.router)
api_router.include_router(inventory_item_router.router)
api_router.include_router(maintenance_router.router)
api_router.include_router(notification_subscription_router.router)
api_router.include_router(section_router.router)
api_router.include_router(user_router.router)
api_router.include_router(report_router.router)
api_router.include_router(backup_router.router)
api_router.include_router(health_router.router)