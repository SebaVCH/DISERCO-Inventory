import {create} from 'zustand';

type UserProfile = {
    id?: number;
    full_name: string;
    email?: string;
}

interface UserStoreState {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    setSession: (token: string, user: UserProfile) => void;
    setUser: (user: UserProfile) => void;
    clearSession: () => void;
}

const initialToken = localStorage.getItem('token');

const useUserStore = create<UserStoreState>((set) => ({
    user: null,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    setSession: (token, user) => {
        localStorage.setItem('token', token);
        set({token, user, isAuthenticated: true});
    },
    setUser: (user) => set((state) => ({user, isAuthenticated: state.isAuthenticated || Boolean(user)})),
    clearSession: () => {
        localStorage.removeItem('token');
        set({user: null, token: null, isAuthenticated: false});
    },
}));

export default useUserStore;
