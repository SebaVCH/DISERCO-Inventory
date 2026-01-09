import type {User} from "../types/user.ts";
import axiosInstance from "../lib/axios.ts";

const sectionPath = '/sections';

const sectionAPI = {
    createSection: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${sectionPath}/`);
        return response.data;
    },

    getSections: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${sectionPath}/`);
        return response.data;
    },

    getSectionByID: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${sectionPath}/`);
        return response.data;
    },

    updateSection: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.put(`${sectionPath}/${id}`);
        return response.data;
    },

    deleteSection: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.delete(`${sectionPath}/${id}`);
        return response.data;
    }
}

export default sectionAPI;