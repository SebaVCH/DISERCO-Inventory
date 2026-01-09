import type {InventoryItem} from "../types/inventoryItem.ts";
import axiosInstance from "../lib/axios.ts";

const inventoryItemPath = '/inventory-item';

const inventoryItemAPI = {
    createItem: async (): Promise<InventoryItem[]> => {
        const response = await axiosInstance.post(`${inventoryItemPath}`);
        return response.data;
    },

    createItemEntry: async (id: number): Promise<InventoryItem[]> => {
        const response = await axiosInstance.post(`${inventoryItemPath}/entry/${id}`);
        return response.data;
    },

    createItemExit: async (id: number): Promise<InventoryItem[]> => {
        const response = await axiosInstance.post(`${inventoryItemPath}/exit/${id}`);
        return response.data;
    },

    deleteItem: async (id: number): Promise<InventoryItem[]> => {
        const response = await axiosInstance.post(`${inventoryItemPath}/${id}`);
        return response.data;
    },

    updateItem: async (id: number): Promise<InventoryItem[]> => {
        const response = await axiosInstance.put(`${inventoryItemPath}/${id}`);
        return response.data;
    }
}

export default inventoryItemAPI;