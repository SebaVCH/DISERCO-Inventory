from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/total-inventory")
def get_total_inventory():
    return print("Total inventory")

@router.get("/critical-inventory")
def get_critical_inventory():
    return print("Critical inventory")

@router.get("/inventory-movement")
def get_movement_inventory():
    return print("Inventory Movements")
