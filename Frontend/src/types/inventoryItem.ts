export interface InventoryItem {
    id: number
    section?: string
    name: string
    description?: string
    total_entries: number
    total_exits: number
    current_stock: number
    has_critical_stock: boolean
    critical_stock_quantity?: number
    comments?: string
}