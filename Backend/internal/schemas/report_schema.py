from datetime import datetime
from pydantic import BaseModel

from internal.domain.user import User

class ReportBase(BaseModel):
    user_id: int
    frequency: str
    description: str | None = None

class ReportCreate(BaseModel):
    user_id: int
    frequency: str
    description: str | None = None
    generated_at: datetime
    period_start: datetime
    period_end: datetime

class UserSimple(BaseModel):
    full_name: str

    model_config = {
        "from_attributes": True
    }

class ReportRead(ReportBase):
    id: int
    generated_at: datetime
    period_start: datetime
    period_end: datetime
    user: UserSimple

    model_config = {
        "from_attributes": True
    }
