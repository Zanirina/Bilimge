import axios, { type AxiosError } from "axios";
import { env } from "../lib/env";
import { storage } from "../lib/storage";
import { endpoints } from "./endpoints";

export const http = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
});

// Public endpoints must NOT carry an Authorization header: DRF runs JWT
// authentication before permissions, so a stale/expired token would make
// even an AllowAny view (login/register/refresh) reject the request with 401.
const PUBLIC_ENDPOINTS = [
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.refresh,
  endpoints.auth.resetPassword,
  endpoints.auth.resetPasswordConfirm,
];

http.interceptors.request.use((config) => {
  const url = String(config.url ?? "");
  const isPublic = PUBLIC_ENDPOINTS.some((e) => url.includes(e));
  const token = storage.getAccessToken();
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    if (status !== 401) return Promise.reject(error);

    const url = String(original?.url ?? "");

    // Never attempt refresh for auth endpoints themselves
    const isAuthEndpoint =
      url.includes(endpoints.auth.login) ||
      url.includes(endpoints.auth.register) ||
      url.includes(endpoints.auth.refresh) ||
      url.includes(endpoints.auth.me);

    if (isAuthEndpoint) return Promise.reject(error);

    // No refresh token → just propagate 401; the calling code decides what to do
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) return Promise.reject(error);

    // Already retried once → session is dead, go to login
    if (original._retry) {
      storage.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${env.API_URL}${endpoints.auth.refresh}`,
        { refresh: refreshToken }
      );
      storage.setTokens(data.access, refreshToken);
      http.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return http(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      storage.clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
