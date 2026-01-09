import axiosInstance from "../lib/axios.ts";
import type {InventoryItem} from "../types/inventoryItem.ts";

const inventoryPath = '/inventory';

const inventoryAPI = {
    getTotalInventory: async (): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/total-inventory`);
        return response.data;
    },

    getCriticalInventory: async (): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/critical-inventory`);
        return response.data;
    },

    getInventoryMovement: async (): Promise<InventoryItem[]> => {
        const response = await axiosInstance.get(`${inventoryPath}/inventory-movement`);
        return response.data;
    }
};

export default inventoryAPI;