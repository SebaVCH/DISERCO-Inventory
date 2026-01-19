export interface InventoryMovement {
    id: number
    inventory_item: string
    user: string
    quantity: number
    movement_type: string
    observation?: string
    created_at: string
    description?: string
}