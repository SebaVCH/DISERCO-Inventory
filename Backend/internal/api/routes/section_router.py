from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from internal.domain.section import Section
from internal.infrastructure.database.db import get_db
from internal.schemas import SectionRead

router = APIRouter(prefix="/section", tags=["section"])

@router.post("/")
def create_section():
    return {"message": "Section created"}

@router.get("/", response_model=List[SectionRead])
def get_sections(db: Session = Depends(get_db)):
    sections = db.query(Section).filter(Section.is_deleted == False).all()
    return sections

@router.get("/{section_id}")
def get_section(section_id: int):
    return {"section_id": section_id}

@router.put("/{section_id}")
def update_section(section_id: int):
    return {"section_id": section_id}

@router.delete("/{section_id}")
def delete_section(section_id: int ,db: Session = Depends(get_db)):
    db.query(Section).filter(Section.id == section_id).update({"is_deleted": True})
    db.commit()
    return {"Sección eliminada"}
