import axios, { type AxiosError } from "axios";
import { getToken, clearToken } from "@/lib/auth/token";
import { useSessionStore } from "@/stores/session-store";
import { queryClient } from "@/lib/query-client";

// Endpoint constants already include "/api"; keep Axios same-origin so they
// resolve to "/api/..." rather than duplicating the prefix.
// (app/api/[...path]/route.ts). We keep the proxy even with bearer tokens: it
// still hides the real BACKEND_URL from the browser and avoids needing CORS
// configured on the Express side. Only what the proxy forwards changes (see
// the route.ts patch below) — not whether it exists.
export const http = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      useSessionStore.getState().setSession(null);
      queryClient.clear();
      const onLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
      if (!onLoginPage) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  },
);

// Same external shape as the old fetch-based client — this is why nothing in
// features/*/api.ts or lib/api/create-resource-hooks.ts needs to change at all.
export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    http.get<T>(url, { params }).then((r) => r.data),
  post: <T>(url: string, body?: unknown) =>
    http.post<T>(url, body).then((r) => r.data),
  put: <T>(url: string, body?: unknown) =>
    http.put<T>(url, body).then((r) => r.data),
  delete: <T>(url: string) =>
    http.delete<T>(url).then((r) => r.data),
};