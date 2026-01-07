from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.user import User

class NotificationSubscription(Base):
    __tablename__ = "notification_subscription"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id"), unique=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="notification_subscription")
