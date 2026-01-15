from pydantic import BaseModel, EmailStr
from internal.schemas.notification_subscription_schema import NotificationSubscriptionRead

class AppUserBase(BaseModel):
    email: EmailStr
    full_name: str

class AppUserCreate(AppUserBase):
    password_hash: str

class AppUserLogin(BaseModel):
    email: EmailStr
    password: str

class AppUserRead(AppUserBase):
    id: int
    notification_subscription: NotificationSubscriptionRead | None = None

    model_config = {
        "from_attributes": True
    }

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MessageResponse(BaseModel):
    message: str
