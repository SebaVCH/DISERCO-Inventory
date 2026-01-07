from pydantic import BaseModel

class InventoryItemBase(BaseModel):
    name: str
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool = False
    critical_stock_quantity: int | None = None
    comments: str | None = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: str | None = None
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool | None = None
    critical_stock_quantity: int | None = None
    comments: str | None = None

class InventoryItemRead(InventoryItemBase):
    id: int
    total_entries: int
    total_exits: int
    current_stock: int

    model_config = {
        "from_attributes": True
    }

class InventoryItemSummary(BaseModel):
    id: int
    name: str
    current_stock: int
    has_critical_stock: bool
    critical_stock_quantity: int | None = None

    model_config = {
        "from_attributes": True
    }

