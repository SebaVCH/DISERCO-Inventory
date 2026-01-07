from pydantic import BaseModel

class MaintenanceBase(BaseModel):
    description: str | None = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    description: str | None = None

class MaintenanceRead(MaintenanceBase):
    id: int

    model_config = {
        "from_attributes": True
    }
