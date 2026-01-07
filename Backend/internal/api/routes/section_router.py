from fastapi import APIRouter

router = APIRouter(prefix="/section", tags=["section"])

@router.post("/")
def create_section():
    return {"message": "Section created"}

@router.get("/")
def get_sections():
    return {"message": "Sections listed"}

@router.get("/{section_id}")
def get_section(section_id: int):
    return {"section_id": section_id}

@router.put("/{section_id}")
def update_section(section_id: int):
    return {"section_id": section_id}

@router.delete("/{section_id}")
def delete_section(section_id: int):
    return {"section_id": section_id}