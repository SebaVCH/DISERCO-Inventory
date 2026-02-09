import axiosInstance from "../lib/axios.ts";
import type {InventoryItem} from "../types/inventoryItem.ts";
import type {InventoryMovement} from "../types/inventoryMovement.ts";

const inventoryPath = '/inventory';

const inventoryAPI = {
    getTotalInventory: async (status: 'all' | 'unhidden' | 'hidden' | 'critical' | 'tools' | 'non-tools'| 'not-received-tools' = 'all'): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/total-inventory/${status}`);
        return Array.isArray(response.data) ? response.data : [];
    },

    getInventoryMovement: async (): Promise<InventoryMovement[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/inventory-movement`);
        return Array.isArray(response.data) ? response.data : [];
    }
};

export default inventoryAPI;