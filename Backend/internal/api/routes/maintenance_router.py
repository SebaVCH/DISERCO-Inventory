from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from internal.domain.inventory_item_maintenance import InventoryItemMaintenance
from internal.infrastructure.database.db import get_db

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("/")
def create_maintenance():
    return {"message": "Maintenance created"}

@router.get("/")
def get_maintenances(db: Session = Depends(get_db)):
    maintenances = db.query(InventoryItemMaintenance).options(joinedload(InventoryItemMaintenance.inventory_item), joinedload(InventoryItemMaintenance.maintenance)).all()
    return maintenances

@router.delete("/{maintenance_id}")
def delete_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}

@router.put("/{maintenance_id}")
def update_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}

@router.get("/{maintenance_id}")
def get_maintenance(maintenance_id: int):
    return {"maintenance_id": maintenance_id}