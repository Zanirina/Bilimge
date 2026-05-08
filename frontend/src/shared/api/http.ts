import axios, { type AxiosError } from "axios";
import { env } from "../lib/env";
import { storage } from "../lib/storage";
import { endpoints } from "./endpoints";

export const http = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ← JWT uses Bearer
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const url = String(original?.url ?? "");

    const isLogin = url.includes(endpoints.auth.login);
    const isRegister = url.includes(endpoints.auth.register);
    const isMe = url.includes(endpoints.auth.me);

    if (status === 401 && !isLogin && !isRegister && !isMe) {
      storage.clearTokens();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);