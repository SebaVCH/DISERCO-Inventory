import axiosInstance from "../lib/axios.ts";
import type { Report } from "../types/report.ts";

const reportPath = '/report';

const reportAPI = {
    getReports: async (): Promise<Report[]> => {
        const response = await axiosInstance.get(`${reportPath}/`);
        return Array.isArray(response.data) ? response.data : [];
    },

    createReport: async (payload: {
        user_id: number;
        frequency: string;
        description?: string;
        period_start: string;
        period_end: string;
        generated_at: string;
    }): Promise<Report> => {
        const response = await axiosInstance.post(`${reportPath}/`, payload);
        return response.data;
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
