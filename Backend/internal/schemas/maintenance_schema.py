from datetime import datetime
from pydantic import BaseModel

class MaintenanceItemAssignment(BaseModel):
    inventory_item_id: int
    inventory_item_maintenance_description: str | None = None

class MaintenanceBase(BaseModel):
    description: str | None = None

class MaintenanceCreate(MaintenanceBase):
    items: list[MaintenanceItemAssignment] = []

class MaintenanceUpdate(BaseModel):
    description: str | None = None

class MaintenanceRead(MaintenanceBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
