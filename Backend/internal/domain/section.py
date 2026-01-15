from typing import List, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import mapped_column, Mapped, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.inventory_item import InventoryItem

class Section(Base):
    __tablename__ = "section"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(55), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(nullable=False, default=False)

    inventory_items: Mapped[List["InventoryItem"]] = relationship(back_populates="section")