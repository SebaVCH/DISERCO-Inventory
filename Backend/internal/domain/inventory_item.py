from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, true
from sqlalchemy.orm import mapped_column, Mapped, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.section import Section
    from internal.domain.inventory_movement import InventoryMovement
    from internal.domain.inventory_item_maintenance import InventoryItemMaintenance
    from internal.domain.report_inventory_item import ReportInventoryItem

class InventoryItem(Base):
    __tablename__ = "inventory_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    section_id: Mapped[Optional[int]] = mapped_column(ForeignKey("section.id"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    total_entries: Mapped[int] = mapped_column(nullable=False, default=0)
    total_exits: Mapped[int] = mapped_column(nullable=False, default=0)
    current_stock: Mapped[int] = mapped_column(nullable=False, default=0)
    has_critical_stock: Mapped[bool] = mapped_column(nullable=False, default=False)
    critical_stock_quantity: Mapped[Optional[int]] = mapped_column()
    comments: Mapped[Optional[str]] = mapped_column(String(255))
    is_deleted: Mapped[bool] = mapped_column(nullable=False, default=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column()

    section: Mapped[Optional["Section"]] = relationship(back_populates="inventory_items")
    movements: Mapped[List["InventoryMovement"]] = relationship(back_populates="inventory_item")
    maintenances: Mapped[List["InventoryItemMaintenance"]] = relationship(back_populates="inventory_item")
    reports: Mapped[List["ReportInventoryItem"]] = relationship(back_populates="inventory_item")
