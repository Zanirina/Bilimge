import { create } from "zustand";
import { authService } from "../api/authService";
import { storage } from "../../../shared/lib/storage";
import type {
  User,
  UpdateProfileRequest,
  UpdateMeRequest,
  ChangePasswordRequest,
  FavoriteItem,
  FavoriteUniversity,
} from "./types";

type AuthState = {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  favorites: FavoriteItem[];
  favoriteUniversities: FavoriteUniversity[];

  register: (data: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => Promise<User | null>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateMe: (data: UpdateMeRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (programCode: string) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  fetchFavoriteUniversities: () => Promise<void>;
  addFavoriteUniversity: (universityCode: number | string) => Promise<void>;
  removeFavoriteUniversity: (id: number) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => {
  let checkPromise: Promise<User | null> | null = null;

  const doCheck = async (): Promise<User | null> => {
    set({ isLoading: true });
    try {
      const res = await authService.getMe();
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
    favorites: [],
    favoriteUniversities: [],

    register: async (data) => {
      await authService.register({
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      const loginRes = await authService.login({ email: data.email, password: data.password });
      const { access, refresh } = loginRes.data;
      if (!access) throw new Error("No token received");
      storage.setTokens(access, refresh);
      // RegisterSerializer only accepts email/password/phone, so the name
      // entered at signup must be saved separately via PATCH /auth/me/.
      if (data.first_name || data.last_name) {
        await authService.updateMe({
          first_name: data.first_name,
          last_name: data.last_name,
        });
      }
      const meRes = await authService.getMe();
      set({ isAuth: true, user: meRes.data });
    },

    login: async (email, password) => {
      const response = await authService.login({ email, password });
      const { access, refresh } = response.data;
      if (!access) throw new Error("No token received");
      storage.setTokens(access, refresh);
      const meRes = await authService.getMe();
      const user: User = meRes.data;
      set({ isAuth: true, user });
      return user;
    },

    logout: () => {
      authService.logout();
      storage.clearTokens();
      set({ isAuth: false, user: null, isLoading: false, favorites: [], favoriteUniversities: [] });
    },

    checkAuth: async () => {
      if (!checkPromise) {
        checkPromise = doCheck().finally(() => {
          checkPromise = null;
        });
      }
      return checkPromise;
    },

    updateProfile: async (data) => {
      const res = await authService.updateProfile(data);
      set((state) => ({ user: state.user ? { ...state.user, ...res.data } : res.data }));
    },

    updateMe: async (data) => {
      const res = await authService.updateMe(data);
      set({ user: res.data });
    },

    changePassword: async (data) => {
      await authService.changePassword(data);
    },

    uploadAvatar: async (file) => {
      const res = await authService.uploadAvatar(file);
      const url = res.data.avatar_url;
      set((state) => ({
        user: state.user ? { ...state.user, avatar_url: url } : state.user,
      }));
      return url;
    },

    fetchFavorites: async () => {
      const res = await authService.getFavorites();
      const groups = Array.isArray(res.data) ? res.data : [];
      const flat: FavoriteItem[] = groups.flatMap((g) =>
        g.programs.map((p) => ({
          id: p.id,
          program: p.program_code,
          program_name: p.program_name,
          university_name: g.university_name,
          university_code: String(g.university_code),
          created_at: "",
        }))
      );
      set({ favorites: flat });
    },

    addFavorite: async (programCode) => {
      const res = await authService.addFavorite({ program: programCode });
      set((state) => ({ favorites: [...state.favorites, res.data] }));
      const me = get().user;
      if (me) set({ user: { ...me, favorites_count: me.favorites_count + 1 } });
    },

    removeFavorite: async (id) => {
      await authService.deleteFavorite(id);
      set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) }));
      const me = get().user;
      if (me) set({ user: { ...me, favorites_count: Math.max(0, me.favorites_count - 1) } });
    },

    fetchFavoriteUniversities: async () => {
      const res = await authService.getFavoriteUniversities();
      set({ favoriteUniversities: Array.isArray(res.data) ? res.data : [] });
    },

    addFavoriteUniversity: async (universityCode) => {
      const res = await authService.addFavoriteUniversity(universityCode);
      set((state) => {
        const exists = state.favoriteUniversities.some(
          (f) => String(f.university_code) === String(universityCode)
        );
        return exists
          ? state
          : { favoriteUniversities: [...state.favoriteUniversities, res.data] };
      });
    },

    removeFavoriteUniversity: async (id) => {
      await authService.deleteFavoriteUniversity(id);
      set((state) => ({
        favoriteUniversities: state.favoriteUniversities.filter((f) => f.id !== id),
      }));
    },
  };
});
