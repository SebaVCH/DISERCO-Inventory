from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.inventory_item import InventoryItem
    from internal.domain.maintenance import Maintenance

class InventoryItemMaintenance(Base):
    __tablename__ = "inventory_item_maintenance"

    id: Mapped[int] = mapped_column(primary_key=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_item.id"), nullable=False)
    maintenance_id: Mapped[int] = mapped_column(ForeignKey("maintenance.id"), nullable=False)

    inventory_item: Mapped["InventoryItem"] = relationship(back_populates="maintenances")
    maintenance: Mapped["Maintenance"] = relationship(back_populates="inventory_item_maintenances")