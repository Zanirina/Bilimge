import { create } from "zustand";
import { authService } from "../api/authService";
import { storage } from "../../../shared/lib/storage";
import type { User } from "./types";

type AuthState = {
    user: User | null;
    isAuth: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    checkAuth: () => Promise<User | null>;
    register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
    let checkPromise: Promise<User | null> | null = null;

    const doCheck = async (): Promise<User | null> => {
        set({ isLoading: true });
        try {
            const res = await authService.getMe();
            console.log("Me response:", res.data);
            set({ isAuth: true, user: res.data });
            return res.data;
        } catch {
            set({ isAuth: false, user: null });
            return null;
        } finally {
            set({ isLoading: false });
        }
    };

    return {
        user: null,
        isAuth: false,
        isLoading: true,

        register: async (data) => {
            await authService.register(data);
            const loginRes = await authService.login({ email: data.email, password: data.password });
            const { access, refresh } = loginRes.data;
            if (!access) throw new Error("No token received");
            storage.setTokens(access, refresh);
            const meRes = await authService.getMe();
            set({ isAuth: true, user: meRes.data });
        },

        login: async (email, password) => {
            const response = await authService.login({ email, password });

            const { access, refresh } = response.data;
            if (!access) throw new Error("No token received");

            storage.setTokens(access, refresh); // ← save both tokens

            const meRes = await authService.getMe();
            const user: User = meRes.data;
            set({ isAuth: true, user });
            return user;
        },

        logout: () => {
            authService.logout();
            storage.clearTokens();
            set({ isAuth: false, user: null, isLoading: false });
        },

        checkAuth: async () => {
            if (!checkPromise) {
                checkPromise = doCheck().finally(() => {
                    checkPromise = null;
                });
            }
            return checkPromise;
        },
    };
});