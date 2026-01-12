from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import update
from sqlalchemy.orm import Session
from datetime import datetime

from internal.domain.inventory_movement import InventoryMovement
from internal.domain.inventory_item import InventoryItem
from internal.infrastructure.database.db import get_db
from internal.schemas import InventoryItemCreate, InventoryMovementCreate

router = APIRouter(prefix="/inventory-item", tags=["inventory-item"])

@router.post("/")
def create_inventory_item(inventory_item_data: InventoryItemCreate,db: Session = Depends(get_db)):
    new_inventory_item = InventoryItem(**inventory_item_data.model_dump())
    db.add(new_inventory_item)
    db.commit()
    db.refresh(new_inventory_item)
    return new_inventory_item

@router.post("/entry/{item_id}/user/{user_id}")
def create_inventory_item_entry(
    inventory_item_movement_data: InventoryMovementCreate,
    item_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    new_inventory_item_entry = InventoryMovement(
        inventory_item_id=item_id,
        user_id=user_id,
        quantity=inventory_item_movement_data.quantity,
        movement_type="entry",
        observation=inventory_item_movement_data.observation,
        created_at=datetime.now(ZoneInfo("America/Santiago")),
    )
    db.add(new_inventory_item_entry)
    db.query(InventoryItem).filter(InventoryItem.id == item_id).update(
        {"current_stock": InventoryItem.current_stock + inventory_item_movement_data.quantity,
         "total_entries": InventoryItem.total_entries + inventory_item_movement_data.quantity}
    )
    db.commit()
    db.refresh(new_inventory_item_entry)
    return new_inventory_item_entry

@router.post("/exit/{item_id}/user/{user_id}")
def create_inventory_item_exit(
    inventory_item_movement_data: InventoryMovementCreate,
    item_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    new_inventory_item_exit = InventoryMovement(
        inventory_item_id=item_id,
        user_id=user_id,
        quantity=inventory_item_movement_data.quantity,
        movement_type="exit",
        observation=inventory_item_movement_data.observation,
        created_at=datetime.now(ZoneInfo("America/Santiago")),
    )
    db.add(new_inventory_item_exit)
    db.query(InventoryItem).filter(InventoryItem.id == item_id).update(
        {"current_stock": InventoryItem.current_stock - inventory_item_movement_data.quantity,
         "total_exits": InventoryItem.total_exitsd
                        + inventory_item_movement_data.quantity}
    )
    db.commit()
    db.refresh(new_inventory_item_exit)
    return new_inventory_item_exit

@router.delete("/{inventory_item_id}")
def delete_inventory_item(inventory_item_id: int, db: Session = Depends(get_db)):
    db.query(InventoryItem).filter(InventoryItem.id == inventory_item_id).update({"is_deleted": True})
    db.commit()
    return {"Elemento borrado"}

@router.put("/{inventory_item_id}")
def update_inventory_item(inventory_item_id: int,data: dict ,db: Session = Depends(get_db) ):
    db.execute(update(InventoryItem).filter_by(id=inventory_item_id).values(**data))
    db.commit()
    return {"Elemento actualizado"}