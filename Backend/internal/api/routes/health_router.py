from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from internal.infrastructure.database.db import get_db

router = APIRouter(prefix="/health", tags=["health"])
@router.head("", status_code=200)
def health_check(db: Session = Depends(get_db())):
    db.execute("SELECT 1")
    return {"status": "ok"}
