import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import { storage } from "../../../shared/lib/storage"; 
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../model/types";

export const authService = {
  register: (data: RegisterRequest) =>
    http.post<AuthResponse>(endpoints.auth.register, data),

  login: async (data: LoginRequest) => {
    const response = await http.post<AuthResponse>(endpoints.auth.login, data);
    return response;
  },

  logout: () => {
    storage.clearTokens();
  },

  getMe: () => http.get<User>(endpoints.auth.me), // ← User instead of MeResponse

  getApplicantProfile: () => http.get(endpoints.auth.applicantProfile),
};