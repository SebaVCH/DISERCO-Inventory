import type {NotificationSubscription} from "../types/notificationSubscription.ts";
import type {User} from "../types/user.ts";
import axiosInstance from "../lib/axios.ts";

const notificationPath = '/notification_subscription';

const notificationAPI = {
    createNotificationSub: async (userId: number): Promise<NotificationSubscription> => {
        const response = await axiosInstance.post(`${notificationPath}/`, { user_id: userId });
        return response.data;
    },
    getNotificationsSubs: async (): Promise<NotificationSubscription[]> => {
        const response = await axiosInstance.get(`${notificationPath}/`);
        return response.data;
    },
    deleteNotificationSub: async (id: number): Promise<{ message?: string } | User[]> => {
        const response = await axiosInstance.delete(`${notificationPath}/${id}`);
        return response.data;
    }
}

export default notificationAPI;