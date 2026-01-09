import type {User} from "../types/user.ts";
import axiosInstance from "../lib/axios.ts";

const maintenancePath = '/maintenance';

const maintenanceAPI = {
    createMaintenance: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${maintenancePath}/`);
        return response.data;
    },

    getMaintenances: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${maintenancePath}/`);
        return response.data;
    },

    deleteMaintenance: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.delete(`${maintenancePath}/${id}`);
        return response.data;
    },

    getMaintenanceByID: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.get(`${maintenancePath}/${id}`);
        return response.data;
    }

}

export default maintenanceAPI;