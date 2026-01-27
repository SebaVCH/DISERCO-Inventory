import {useQuery} from "@tanstack/react-query";
import notificationAPI from "../services/notificationService.ts";

export const useNotificationSubscriptions = () => {
    return useQuery({
        queryKey: ['notification_subscriptions'],
        queryFn: notificationAPI.getNotificationsSubs
    });
}
