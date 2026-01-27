from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from internal.domain.notification_subscription import NotificationSubscription
from internal.infrastructure.database.db import get_db
from internal.schemas import NotificationSubscriptionCreate

router = APIRouter(prefix="/notification_subscription", tags=["notification_subscription"])

@router.post("/")
def create_notification_subscription(notification_data: NotificationSubscriptionCreate,db: Session = Depends(get_db)):
    new_notification = NotificationSubscription(
        user_id=notification_data.user_id
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

@router.get("/")
def get_notification_subscriptions(db: Session = Depends(get_db)):
    users_sub = db.query(NotificationSubscription).options(joinedload(NotificationSubscription.user)).filter(NotificationSubscription.user_id != 0).all()
    return users_sub

@router.delete("/{subscription_id}")
def delete_notification_subscription(subscription_id: int, db: Session = Depends(get_db)):
    db.query(NotificationSubscription).filter(NotificationSubscription.id == subscription_id).delete()
    db.commit()
    return {"Usuario a notificar eliminado"}