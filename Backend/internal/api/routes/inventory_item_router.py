from zoneinfo import ZoneInfo
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session
from datetime import datetime

from internal.domain.inventory_movement import InventoryMovement
from internal.domain.inventory_item import InventoryItem
from internal.infrastructure.database.db import get_db
from internal.schemas import InventoryItemCreate, InventoryMovementCreate

router = APIRouter(prefix="/inventory-item", tags=["inventory-item"])

@router.post("/")
def create_inventory_item(inventory_item_data: InventoryItemCreate, db: Session = Depends(get_db)):
    new_inventory_item = InventoryItem(**inventory_item_data.model_dump())
    db.add(new_inventory_item)
    db.commit()
    db.refresh(new_inventory_item)
    return new_inventory_item

@router.post("/entry/{item_id}/user/{user_id}")
def create_inventory_item_entry(inventory_item_movement_data: InventoryMovementCreate,item_id: int,user_id: int,db: Session = Depends(get_db),):
    try:
        new_inventory_item_entry = InventoryMovement(
            inventory_item_id=item_id,
            user_id=user_id,
            quantity=inventory_item_movement_data.quantity,
            movement_type="Entrada",
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
    except Exception as e:
        db.rollback()
        raise e

    return new_inventory_item_entry

@router.post("/exit/{item_id}/user/{user_id}")
def create_inventory_item_exit(inventory_item_movement_data: InventoryMovementCreate,item_id: int,user_id: int,db: Session = Depends(get_db)):
    try:
        new_inventory_item_exit = InventoryMovement(
            inventory_item_id=item_id,
            user_id=user_id,
            quantity=inventory_item_movement_data.quantity,
            movement_type="Salida",
            observation=inventory_item_movement_data.observation,
            created_at=datetime.now(ZoneInfo("America/Santiago")),
        )
        db.add(new_inventory_item_exit)
        if inventory_item_movement_data.quantity > db.query(InventoryItem).filter(InventoryItem.id == item_id).first().current_stock:
            raise HTTPException(status_code=400, detail="No hay suficiente stock para realizar la salida")
        db.query(InventoryItem).filter(InventoryItem.id == item_id).update(
            {"current_stock": InventoryItem.current_stock - inventory_item_movement_data.quantity,
             "total_exits": InventoryItem.total_exits + inventory_item_movement_data.quantity}
        )

        pattern = r"Persona a cargo:\s*([a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+)"
        match = re.search(pattern, new_inventory_item_exit.observation)
        if match:
            person_name = match.group(1).strip()
            tool_item = db.query(InventoryItem).filter(InventoryItem.id == item_id,InventoryItem.is_tool == True).first()
            if tool_item:
                tool_item.comments = f"Última salida el {new_inventory_item_exit.created_at.strftime('%Y-%m-%d %H:%M:%S')}, persona a cargo: {person_name}"
        else:
            print("No se encontró el nombre de la persona en la observación.")

        db.commit()
        db.refresh(new_inventory_item_exit)
    except Exception as e:
        db.rollback()
        raise e

    return new_inventory_item_exit

@router.delete("/{inventory_item_id}")
def delete_inventory_item(inventory_item_id: int, db: Session = Depends(get_db)):
    existing_item = db.query(InventoryItem).filter(InventoryItem.id == inventory_item_id).first()
    if not existing_item:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    db.query(InventoryItem).filter(InventoryItem.id == inventory_item_id).update({"is_deleted": True, "deleted_at": datetime.now(ZoneInfo("America/Santiago"))})
    db.commit()
    return {"Elemento borrado"}

@router.put("/{inventory_item_id}")
def update_inventory_item(inventory_item_id: int,data: dict ,db: Session = Depends(get_db)):
    existing_item = db.query(InventoryItem).filter(InventoryItem.id == inventory_item_id).first()
    if not existing_item:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    if "is_deleted" in data:
        if data["is_deleted"]:
            data.setdefault("deleted_at", datetime.now(ZoneInfo("America/Santiago")))
        else:
            data["deleted_at"] = None
    db.execute(update(InventoryItem).filter_by(id=inventory_item_id).values(**data))
    db.commit()
    return {"Elemento actualizado"}

@router.delete("/movement/{movement_id}")
def delete_movement(movement_id: int, db: Session = Depends(get_db)):
    movement = db.query(InventoryMovement).filter(InventoryMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    try:
        if movement.movement_type == "Entrada":
            db.query(InventoryItem).filter(InventoryItem.id == movement.inventory_item_id).update(
                {"current_stock": InventoryItem.current_stock - movement.quantity,
                    "total_entries": InventoryItem.total_entries - movement.quantity,})
        elif movement.movement_type == "Salida":
            db.query(InventoryItem).filter(InventoryItem.id == movement.inventory_item_id).update(
                {"current_stock": InventoryItem.current_stock + movement.quantity,
                    "total_exits": InventoryItem.total_exits + movement.quantity,})
        db.query(InventoryMovement).filter(InventoryMovement.id == movement_id).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    return {"Movimiento eliminado"}