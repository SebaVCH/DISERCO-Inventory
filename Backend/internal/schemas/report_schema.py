from datetime import datetime
from pydantic import BaseModel

class ReportBase(BaseModel):
    user_id: int
    frequency: str
    description: str | None = None

class ReportCreate(BaseModel):
    frequency: str
    description: str | None = None
    period_start: datetime
    period_end: datetime

class ReportRead(ReportBase):
    id: int
    generated_at: datetime
    period_start: datetime
    period_end: datetime

    model_config = {
        "from_attributes": True
    }
