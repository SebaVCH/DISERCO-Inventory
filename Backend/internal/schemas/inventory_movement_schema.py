from datetime import datetime
from pydantic import BaseModel

class InventoryMovementBase(BaseModel):
    id: int
    quantity: int
    movement_type: str
    observation: str | None = None
    inventory_item_id: int
    user_id: int | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class InventoryMovementCreate(BaseModel):
    quantity: int
    observation: str | None = None

class InventoryMovementRead(InventoryMovementBase):
    user: str
    inventory_item: str
    inventory_item_description: str | None = None

    model_config = {
        "from_attributes": True
    }
