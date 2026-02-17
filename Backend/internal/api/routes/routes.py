from fastapi import APIRouter, Depends

from internal.api.middleware.auth import authentication
from internal.api.routes import inventory_router, maintenance_router, section_router, user_router, \
    notification_subscription_router, inventory_item_router, report_router, backup_router, health_router

public_router = APIRouter()
public_router.include_router(user_router.public_router)
public_router.include_router(health_router.router)

private_router = APIRouter(
    dependencies=[Depends(authentication)]
)

private_router.include_router(user_router.private_router)
private_router.include_router(inventory_router.router)
private_router.include_router(inventory_item_router.router)
private_router.include_router(maintenance_router.router)
private_router.include_router(notification_subscription_router.router)
private_router.include_router(section_router.router)
private_router.include_router(report_router.router)
private_router.include_router(backup_router.router)