from datetime import datetime
from pydantic import BaseModel

class InventoryMovementBase(BaseModel):
    inventory_item_id: int
    user_id: int
    quantity: int
    movement_type: str
    observation: str | None = None

class InventoryMovementCreate(BaseModel):
    quantity: int
    observation: str | None = None

class InventoryMovementRead(InventoryMovementBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
