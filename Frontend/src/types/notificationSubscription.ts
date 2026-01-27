import type {UserProfile} from "./user.ts";

export interface NotificationSubscription {
    id: number;
    user_id: number;
    user?: UserProfile;
}
