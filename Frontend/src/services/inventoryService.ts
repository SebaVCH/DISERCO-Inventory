import axiosInstance from "../lib/axios.ts";
import type {InventoryItem} from "../types/inventoryItem.ts";

const inventoryPath = '/inventory';

const inventoryAPI = {
    getTotalInventory: async (status: 'all' | 'unhidden' | 'hidden' | 'critical' = 'all'): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/total-inventory/${status}`);
        return response.data;
    },

    getInventoryMovement: async (): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/inventory-movement`);
        return response.data;
    }
};

export default inventoryAPI;