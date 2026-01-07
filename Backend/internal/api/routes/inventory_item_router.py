from fastapi import APIRouter

router = APIRouter(prefix="/inventory-item", tags=["inventory-item"])

@router.post("/")
def create_inventory_item():
    return {"message": "Inventory item created"}

@router.post("/entry/{inventory_item_id}")
def create_inventory_item_entry(inventory_item_id: int):
    return {"message": f"Inventory item entry created for {inventory_item_id}"}

@router.post("/exit/{inventory_item_id}")
def create_inventory_item_exit(inventory_item_id: int):
    return {"message": f"Inventory item exit created for {inventory_item_id}"}

@router.delete("/{inventory_item_id}")
def delete_inventory_item(inventory_item_id: int):
    return {"inventory_item_id": inventory_item_id}

@router.put("/{inventory_item_id}")
def update_inventory_item(inventory_item_id: int):
    return {"inventory_item_id": inventory_item_id}