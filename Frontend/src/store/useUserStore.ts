import {create} from 'zustand';

type UserProfile = {
    id?: number;
    full_name: string;
    email?: string;
}

interface UserStoreState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    setUser: (user: UserProfile) => void;
    clearUser: () => void;
}

const useUserStore = create<UserStoreState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({user, isAuthenticated: true}),
    clearUser: () => set({user: null, isAuthenticated: false}),
}));

export default useUserStore;
