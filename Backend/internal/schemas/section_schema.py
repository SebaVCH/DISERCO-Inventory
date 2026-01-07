from pydantic import BaseModel

class SectionBase(BaseModel):
    name: str

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    name: str | None = None

class SectionRead(SectionBase):
    id: int

    model_config = {
        "from_attributes": True
    }
