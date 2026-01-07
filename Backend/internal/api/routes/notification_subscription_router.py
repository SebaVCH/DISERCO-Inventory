from fastapi import APIRouter

router = APIRouter(prefix="/notification_subscription", tags=["notification_subscription"])

@router.post("/")
def create_notification_subscription():
    return {"message": "Notification subscription created"}

@router.get("/")
def get_notification_subscriptions():
    return {"message": "Notification subscriptions listed"}

@router.delete("/{subscription_id}")
def delete_notification_subscription(subscription_id: int):
    return {"subscription_id": subscription_id}