from pydantic import BaseModel

class ReportInventoryItemBase(BaseModel):
    report_id: int
    inventory_item_id: int
    stock_at_generation: int

class ReportInventoryItemCreate(ReportInventoryItemBase):
    pass

class ReportInventoryItemRead(ReportInventoryItemBase):
    id: int

    model_config = {
        "from_attributes": True
    }
