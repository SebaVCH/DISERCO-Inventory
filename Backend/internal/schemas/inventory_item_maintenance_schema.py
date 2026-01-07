from pydantic import BaseModel

class InventoryItemMaintenanceBase(BaseModel):
    inventory_item_id: int
    maintenance_id: int

class InventoryItemMaintenanceCreate(InventoryItemMaintenanceBase):
    pass

class InventoryItemMaintenanceRead(InventoryItemMaintenanceBase):
    id: int

    model_config = {
        "from_attributes": True
    }
