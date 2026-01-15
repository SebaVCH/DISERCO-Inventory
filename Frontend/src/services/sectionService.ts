import type {Section} from "../types/section";
import axiosInstance from "../lib/axios.ts";

const sectionPath = '/section';

const sectionAPI = {
    createSection: async (): Promise<Section> => {
        const response = await axiosInstance.post(`${sectionPath}/`);
        return response.data;
    },

    getSections: async (): Promise<Section[]> => {
        const response = await axiosInstance.get(`${sectionPath}/`);
        return response.data;
    },

    getSectionByID: async (id: number): Promise<Section> => {
        const response = await axiosInstance.get(`${sectionPath}/${id}`);
        return response.data;
    },

    updateSection: async (id: number): Promise<Section> => {
        const response = await axiosInstance.put(`${sectionPath}/${id}`);
        return response.data;
    },

    deleteSection: async (id: number): Promise<void> => {
        await axiosInstance.delete(`${sectionPath}/${id}`);
    }
}

export default sectionAPI;