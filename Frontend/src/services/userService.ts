import axiosInstance from "../lib/axios.ts";
import type {User} from "../types/user.ts";

const userPath = '/user';

const userAPI = {
    login: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${userPath}/login`);
        return response.data;
    },

    register: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${userPath}/register`);
        return response.data;
    },

    logout: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${userPath}/logout`);
        return response.data;
    },

    getProfile: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${userPath}/profile`);
        return response.data;
    },

    getUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${userPath}/get-users`);
        return response.data;
    },

    getUserByID: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.get(`${userPath}/get-user/${id}`);
        return response.data;
    }
}

export default userAPI;