from pydantic import BaseModel

class NotificationSubscriptionBase(BaseModel):
    user_id: int

class NotificationSubscriptionCreate(NotificationSubscriptionBase):
    pass

class NotificationSubscriptionRead(NotificationSubscriptionBase):
    id: int

    model_config = {
        "from_attributes": True
    }
