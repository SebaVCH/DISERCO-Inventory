from decimal import Decimal
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from internal.domain import Base
if TYPE_CHECKING:
    from internal.domain.inventory_item import InventoryItem
    from internal.domain.user import User

class InventoryMovement(Base):
    __tablename__ = "inventory_movement"

    id: Mapped[int] = mapped_column(primary_key=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_item.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(precision=10, scale=2), nullable=False, default=Decimal('0.00'))
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)
    observation: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    inventory_item: Mapped["InventoryItem"] = relationship(back_populates="movements")
    user: Mapped["User"] = relationship(back_populates="movements")