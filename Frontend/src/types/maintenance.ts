import type {InventoryItem} from "./inventoryItem.ts";

export interface Maintenance {
    id: number
    items: InventoryItem[]
    description: string
}