from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from internal.domain.section import Section
from internal.infrastructure.database.db import get_db
from internal.schemas import SectionRead, SectionCreate, SectionUpdate

router = APIRouter(prefix="/section", tags=["section"])

@router.post("/")
def create_section(section_data: SectionCreate,db: Session = Depends(get_db)):
    new_section = Section(**section_data.model_dump())
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section

@router.get("/", response_model=List[SectionRead])
def get_sections(db: Session = Depends(get_db)):
    sections = db.query(Section).filter(Section.is_deleted == False).all()
    return sections

@router.put("/{section_id}")
def update_section(section_id: int, section_data: SectionUpdate,db: Session = Depends(get_db)):
    existing_section = db.query(Section).filter(Section.id == section_id).first()
    if not existing_section:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
    db.execute(update(Section).filter_by(id=section_id).values(**section_data.model_dump()))
    db.commit()
    return {"Sección actualida"}

@router.delete("/{section_id}")
def delete_section(section_id: int ,db: Session = Depends(get_db)):
    existing_section = db.query(Section).filter(Section.id == section_id).first()
    if not existing_section:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
    db.query(Section).filter(Section.id == section_id).update({"is_deleted": True})
    db.commit()
    return {"Sección eliminada"}
