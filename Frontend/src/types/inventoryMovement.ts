export interface InventoryMovement {
    id: number
    item: string
    user: string
    quantity: number
    movement_type: string
    observation?: string
    created_at: string
}