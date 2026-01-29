from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Any

from internal.domain.inventory_movement import InventoryMovement
from internal.domain.inventory_item import InventoryItem
from internal.infrastructure.database.db import get_db
from internal.schemas import InventoryMovementRead, InventoryItemRead

router = APIRouter(prefix="/inventory", tags=["inventory"])

def append_section_name(inventory: list[Any], result: list[Any]):
    for item in inventory:
        result.append(InventoryItemRead(
            id=item.id,
            name=item.name,
            section_id=item.section_id,
            total_entries=item.total_entries,
            total_exits=item.total_exits,
            current_stock=item.current_stock,
            section_name=item.section.name if item.section else "",
            description=item.description,
            has_critical_stock=item.has_critical_stock,
            critical_stock_quantity=item.critical_stock_quantity,
            comments=item.comments,
            is_deleted=item.is_deleted,
            deleted_at=item.deleted_at
        ))

@router.get("/total-inventory/{status}", response_model=List[InventoryItemRead])
def get_total_inventory(status: str,db: Session = Depends(get_db)):
    result = []
    if status == "all":
        inventory = db.query(InventoryItem).options(joinedload(InventoryItem.section)).all()
        append_section_name(inventory, result)
    if status == "unhidden":
        inventory = db.query(InventoryItem).filter(InventoryItem.is_deleted == False).options(joinedload(InventoryItem.section)).all()
        append_section_name(inventory, result)
    if status == "hidden":
        inventory = db.query(InventoryItem).filter(InventoryItem.is_deleted == True).options(joinedload(InventoryItem.section)).all()
        append_section_name(inventory, result)
    if status == "critical":
        critical_inventory = db.query(InventoryItem).options(joinedload(InventoryItem.section)).filter(
            (InventoryItem.has_critical_stock == True)
            &
            (InventoryItem.current_stock <= InventoryItem.critical_stock_quantity + ((InventoryItem.total_exits + InventoryItem.total_entries) * 0.1 ))
            &
            (InventoryItem.is_deleted == False)
        ).all()
        append_section_name(critical_inventory, result)
    return result

@router.get("/inventory-movement", response_model=List[InventoryMovementRead])
def get_movement_inventory(db: Session = Depends(get_db)):
    inventory_movements = db.query(InventoryMovement).options(joinedload(InventoryMovement.user), joinedload(InventoryMovement.inventory_item)).all()
    result = []
    for item in inventory_movements:
        result.append(InventoryMovementRead(
            id = item.id,
            inventory_item= item.inventory_item.name,
            inventory_item_description= item.inventory_item.description,
            inventory_item_id= item.inventory_item.id,
            user= item.user.full_name,
            quantity= item.quantity,
            movement_type= item.movement_type,
            observation= item.observation,
            created_at= item.created_at
        ))

    return result