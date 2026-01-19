import type {Section} from "../types/section";
import axiosInstance from "../lib/axios.ts";

const sectionPath = '/section';

const sectionAPI = {
    createSection: async (data : {name : string}): Promise<Section> => {
        const response = await axiosInstance.post(`${sectionPath}/`, data);
        return response.data;
    },

    getSections: async (): Promise<Section[]> => {
        const response = await axiosInstance.get(`${sectionPath}/`);
        return response.data;
    },

    updateSection: async (id: number, data : {name : string}): Promise<Section> => {
        const response = await axiosInstance.put(`${sectionPath}/${id}`, data);
        return response.data;
    },

    deleteSection: async (id: number): Promise<void> => {
        await axiosInstance.delete(`${sectionPath}/${id}`);
    }
}

export default sectionAPI;