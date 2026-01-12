from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from internal.domain import Base

if TYPE_CHECKING:
    from internal.domain.report import Report
    from internal.domain.inventory_item import InventoryItem

class ReportInventoryItem(Base):
    __tablename__ = "report_inventory_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("report.id"), nullable=False)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_item.id"), nullable=False)
    stock_at_generation: Mapped[int] = mapped_column(nullable=False)

    report: Mapped["Report"] = relationship(back_populates="items")
    inventory_item: Mapped["InventoryItem"] = relationship()
