import axiosInstance from "../lib/axios.ts";
import type { Report } from "../types/report.ts";

const reportPath = '/report';

const reportAPI = {
    getReports: async (): Promise<Report[]> => {
        const response = await axiosInstance.get(`${reportPath}/`);
        return Array.isArray(response.data) ? response.data : [];
    },

    downloadReport: async (id: number): Promise<Blob> => {
        const response = await axiosInstance.get(`${reportPath}/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    deleteReport: async (id: number): Promise<void> => {
        await axiosInstance.delete(`${reportPath}/${id}`);
    }
};

export default reportAPI;
