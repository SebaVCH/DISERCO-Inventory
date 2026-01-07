from fastapi import APIRouter

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("/")
def create_maintenance():
    return {"message": "Maintenance created"}

@router.get("/")
def get_maintenances():
    return {"message": "Maintenances listed"}

@router.delete("/{maintenance_id}")
def delete_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}

@router.put("/{maintenance_id}")
def update_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}

@router.get("/{maintenance_id}")
def get_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}