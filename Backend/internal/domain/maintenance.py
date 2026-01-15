from typing import List, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import mapped_column, Mapped, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.inventory_item_maintenance import InventoryItemMaintenance

class Maintenance(Base):
    __tablename__ = "maintenance"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(255))

    inventory_item_maintenances: Mapped[List["InventoryItemMaintenance"]] = relationship(back_populates="maintenance")