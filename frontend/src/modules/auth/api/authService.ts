import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import { storage } from "../../../shared/lib/storage";
import type {
  AuthResponse,
  RefreshResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UpdateMeRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  User,
  FavoriteItem,
  AddFavoriteRequest,
} from "../model/types";

export const authService = {
  register: (data: RegisterRequest) =>
    http.post<AuthResponse>(endpoints.auth.register, data),

  login: (data: LoginRequest) =>
    http.post<AuthResponse>(endpoints.auth.login, data),

  refreshToken: (refresh: string) =>
    http.post<RefreshResponse>(endpoints.auth.refresh, { refresh }),

  logout: () => {
    storage.clearTokens();
  },

  getMe: () =>
    http.get<User>(endpoints.auth.me),

  updateProfile: (data: UpdateProfileRequest) =>
    http.patch<User>(endpoints.auth.applicantProfile, data),

  updateMe: (data: UpdateMeRequest) =>
    http.patch<User>(endpoints.auth.me, data),

  changePassword: (data: ChangePasswordRequest) =>
    http.post<{ message: string }>(endpoints.auth.changePassword, data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return http.post<{ avatar_url: string }>(endpoints.auth.uploadAvatar, form, {
      headers: { "Content-Type": undefined },
    });
  },

  resetPassword: (data: ResetPasswordRequest) =>
    http.post<{ message: string }>(endpoints.auth.resetPassword, data),

  resetPasswordConfirm: (data: ResetPasswordConfirmRequest) =>
    http.post<{ message: string }>(endpoints.auth.resetPasswordConfirm, data),

  getFavorites: () =>
    http.get<FavoriteItem[]>(endpoints.auth.favorites),

  addFavorite: (data: AddFavoriteRequest) =>
    http.post<FavoriteItem>(endpoints.auth.favorites, data),

  deleteFavorite: (id: number) =>
    http.delete(endpoints.auth.favoriteById(id)),
};
