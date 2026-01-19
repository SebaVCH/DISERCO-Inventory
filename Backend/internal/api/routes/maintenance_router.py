from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from internal.domain.inventory_item_maintenance import InventoryItemMaintenance
from internal.domain.maintenance import Maintenance
from internal.infrastructure.database.db import get_db
from internal.schemas import MaintenanceCreate

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("/")
def create_maintenance(maintenance_data: MaintenanceCreate, db: Session = Depends(get_db)):
    try:
        new_maintenance = Maintenance(description=maintenance_data.description)
        db.add(new_maintenance)
        db.flush()

        new_items_maintenances = []
        for item in maintenance_data.items:
            item_description = item.inventory_item_maintenance_description or maintenance_data.description or "Mantenimiento"
            new_items_maintenances.append(
                InventoryItemMaintenance(
                    inventory_item_id=item.inventory_item_id,
                    maintenance_id=new_maintenance.id,
                    inventory_item_maintenance_description=item_description,
                )
            )

        if new_items_maintenances:
            db.add_all(new_items_maintenances)

        db.commit()
        db.refresh(new_maintenance)
    except Exception:
        db.rollback()
        raise

    return new_maintenance

@router.get("/")
def get_maintenances(db: Session = Depends(get_db)):
    maintenances = db.query(InventoryItemMaintenance).options(joinedload(InventoryItemMaintenance.inventory_item), joinedload(InventoryItemMaintenance.maintenance)).all()
    return maintenances

@router.delete("/{maintenance_id}")
def delete_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    existing_maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not existing_maintenance:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    try:
        db.query(InventoryItemMaintenance).filter(InventoryItemMaintenance.maintenance_id == maintenance_id).delete()
        db.query(Maintenance).filter(Maintenance.id == maintenance_id).delete()
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {"Mantenimiento eliminado"}