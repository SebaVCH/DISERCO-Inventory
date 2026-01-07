from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.section import Section
    from internal.domain.invetory_item import InventoryItem

class SectionInventoryItem(Base):
    __tablename__ = "section_inventory_item"
    __table_args__ = (
        UniqueConstraint("section_id", "inventory_item_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("section.id"), nullable=False)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_item.id"), nullable=False)

    section: Mapped["Section"] = relationship()
    inventory_item: Mapped["InventoryItem"] = relationship()

