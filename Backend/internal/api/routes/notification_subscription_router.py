from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from internal.domain.notification_subscription import NotificationSubscription
from internal.infrastructure.database.db import get_db

router = APIRouter(prefix="/notification_subscription", tags=["notification_subscription"])

@router.post("/")
def create_notification_subscription():
    return {"message": "Notification subscription created"}

@router.get("/")
def get_notification_subscriptions(db: Session = Depends(get_db)):
    users_sub = db.query(NotificationSubscription).options(joinedload(NotificationSubscription.user)).all()
    return users_sub

@router.delete("/{subscription_id}")
def delete_notification_subscription(subscription_id: int, db: Session = Depends(get_db)):
    db.query(NotificationSubscription).filter(NotificationSubscription.id == subscription_id).delete()
    db.commit()
    return {"Usuario a notificar eliminado"}