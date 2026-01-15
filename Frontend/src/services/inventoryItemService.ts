import type {InventoryItem} from "../types/inventoryItem.ts";
import axiosInstance from "../lib/axios.ts";

const inventoryItemPath = '/inventory-item';

const inventoryItemAPI = {
    createItem: async (data: Partial<Omit<InventoryItem, 'id' | 'total_entries' | 'total_exits' | 'current_stock' | 'is_deleted' | 'section_name' >>): Promise<InventoryItem> => {
        const response = await axiosInstance.post(`${inventoryItemPath}`, data);
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
        const response = await axiosInstance.delete(`${inventoryItemPath}/${id}`);
        return response.data;
    },

    updateItem: async (id: number, data: Partial<Omit<InventoryItem, 'id' | 'total_entries' | 'total_exits' | 'current_stock' | 'is_deleted' | 'section_name'>>): Promise<any> => {
        const response = await axiosInstance.put(`${inventoryItemPath}/${id}`, data);
        return response.data;
    }
}

export default inventoryItemAPI;