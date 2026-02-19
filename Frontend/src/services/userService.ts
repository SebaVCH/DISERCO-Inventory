import axiosInstance from "../lib/axios.ts";
import type {LoginPayload, RegisterPayload, TokenResponse, User, UserProfile} from "../types/user.ts";

const userPath = '/user';

const userAPI = {
    login: async (payload: LoginPayload): Promise<TokenResponse> => {
        const response = await axiosInstance.post(`${userPath}/login`, payload);
        return response.data;
    },

    register: async (payload: RegisterPayload): Promise<User> => {
        const response = await axiosInstance.post(`${userPath}/register`, {
            email: payload.email,
            full_name: payload.full_name,
            password_hash: payload.password
        });
        return response.data;
    },

    getProfile: async (): Promise<UserProfile> => {
        const response = await axiosInstance.get(`${userPath}/profile`);
        return response.data;
    },

    getUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get(`${userPath}/get-users`);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },
}

export default userAPI;