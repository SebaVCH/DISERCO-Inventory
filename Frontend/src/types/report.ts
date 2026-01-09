import type {InventoryItem} from "./inventoryItem.ts";

export interface Report {
    id: number
    description: string
    items: InventoryItem[]
    generated_at: string
    period_start: string
    period_end: string
}