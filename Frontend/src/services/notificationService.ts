import type {User} from "../types/user.ts";
import axiosInstance from "../lib/axios.ts";

const notificationPath = '/notification-subscription';

const notificationAPI = {
    createNotificationSub: async (): Promise<User[]> => {
        const response = await axiosInstance.post(`${notificationPath}/`);
        return response.data;
    },
    getNotificationsSubs: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${notificationPath}/`);
        return response.data;
    },
    deleteNotificationSub: async (id: number): Promise<User[]> => {
        const response = await axiosInstance.delete(`${notificationPath}/${id}`);
        return response.data;
    }
}

export default notificationAPI;