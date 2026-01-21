export interface InventoryItem {
    id: number
    section_id?: number | null
    section_name?: string
    name: string
    description?: string
    total_entries: number
    total_exits: number
    current_stock: number
    has_critical_stock: boolean
    critical_stock_quantity?: number
    comments?: string
    is_deleted: boolean
    deleted_at: string
}