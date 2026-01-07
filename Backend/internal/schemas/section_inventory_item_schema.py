from pydantic import BaseModel

class SectionInventoryItemBase(BaseModel):
    section_id: int
    inventory_item_id: int

class SectionInventoryItemCreate(SectionInventoryItemBase):
    pass

class SectionInventoryItemRead(SectionInventoryItemBase):
    id: int

    model_config = {
        "from_attributes": True
    }
