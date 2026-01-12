from pydantic import BaseModel

class InventoryItemBase(BaseModel):
    id: int
    name: str
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool = False
    critical_stock_quantity: int | None = None
    comments: str | None = None

class InventoryItemCreate(BaseModel):
    name: str
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool = False
    critical_stock_quantity: int | None = None
    comments: str | None = None
    pass

class InventoryItemUpdate(BaseModel):
    name: str | None = None
    section_id: int | None = None
    description: str | None = None
    has_critical_stock: bool | None = None
    critical_stock_quantity: int | None = None
    comments: str | None = None

class InventoryItemRead(InventoryItemBase):
    total_entries: int
    total_exits: int
    current_stock: int
    section_name: str

    model_config = {
        "from_attributes": True
    }

