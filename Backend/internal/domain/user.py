from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.notification_subscription import NotificationSubscription
    from internal.domain.report import Report
    from internal.domain.inventory_movement import InventoryMovement

class User(Base):
    __tablename__ = "app_user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(nullable=False, default=False)

    notification_subscription: Mapped[Optional["NotificationSubscription"]] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(back_populates="user")
    movements: Mapped[List["InventoryMovement"]] = relationship(back_populates="user")