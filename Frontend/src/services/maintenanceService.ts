import type { MaintenanceAssignment, MaintenanceCreatePayload, MaintenanceSummary } from "../types/maintenance.ts";
import axiosInstance from "../lib/axios.ts";

const maintenancePath = '/maintenance';

const maintenanceAPI = {
    createMaintenance: async (data: MaintenanceCreatePayload): Promise<MaintenanceSummary> => {
        const response = await axiosInstance.post(`${maintenancePath}/`, data);
        return response.data;
    },

    getMaintenances: async (): Promise<MaintenanceAssignment[]> => {
        const response = await axiosInstance.get(`${maintenancePath}/`);
        return Array.isArray(response.data) ? response.data : [];
    },

    deleteMaintenance: async (id: number): Promise<{ detail?: string } | undefined> => {
        const response = await axiosInstance.delete(`${maintenancePath}/${id}`);
        return response.data;
    }
};

export default maintenanceAPI;