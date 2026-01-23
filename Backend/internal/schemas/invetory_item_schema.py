from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

class InventoryItemBase(BaseModel):
    id: int
    name: str
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool = False
    critical_stock_quantity: Decimal | None = None
    comments: str | None = None
    is_deleted: bool = False

class InventoryItemCreate(BaseModel):
    id: int | None = None
    name: str
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool = False
    critical_stock_quantity: Decimal | None = None
    comments: str | None = None
    pass

class InventoryItemUpdate(BaseModel):
    name: str | None = None
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool | None = None
    critical_stock_quantity: Decimal | None = None
    comments: str | None = None

class InventoryItemRead(InventoryItemBase):
    total_entries: Decimal
    total_exits: Decimal
    current_stock: Decimal
    section_name: str
    deleted_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }

