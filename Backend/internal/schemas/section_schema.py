from pydantic import BaseModel

class SectionBase(BaseModel):
    id: int
    name: str

class SectionCreate(SectionBase):
    id: int | None = None
    pass

class SectionUpdate(BaseModel):
    name: str | None = None

class SectionRead(SectionBase):
    id: int

    model_config = {
        "from_attributes": True
    }
