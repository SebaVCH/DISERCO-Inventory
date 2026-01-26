import type { InventoryItem } from './inventoryItem.ts';

export interface MaintenanceAssignment {
    id: number;
    inventory_item_id: number;
    maintenance_id: number;
    inventory_item_maintenance_description: string;
    inventory_item?: InventoryItem;
    maintenance?: {
        id: number;
        description: string;
        created_at: string;
    };
}

export interface MaintenanceRecord {
    id: number;
    description: string;
    created_at: string;
    items: MaintenanceRecordItem[];
}

export interface MaintenanceRecordItem {
    inventory_item_id: number;
    inventory_item_name: string;
    inventory_item_section_name?: string;
    inventory_item_description?: string;
    inventory_item_maintenance_description: string;
}

export interface MaintenanceItemPayload {
    inventory_item_id: number;
    inventory_item_maintenance_description?: string | null;
}

export interface MaintenanceCreatePayload {
    description?: string;
    items: MaintenanceItemPayload[];
}

export interface MaintenanceSummary {
    id: number;
    description: string;
    created_at: string;
}
