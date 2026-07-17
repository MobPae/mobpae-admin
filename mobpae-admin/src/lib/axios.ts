import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  removeToken,
  getTokenRole,
} from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally.
// On 401: attempt one silent refresh before falling back to full logout.
let isRefreshing = false;
type QueuedRequest = {
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean };
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};
let refreshQueue: QueuedRequest[] = [];

function resolveQueue(newToken: string) {
  refreshQueue.forEach(({ originalRequest, resolve }) => {
    originalRequest._retry = true;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    resolve(api(originalRequest));
  });
  refreshQueue = [];
}

function rejectQueue(err: unknown) {
  refreshQueue.forEach(({ reject }) => reject(err));
  refreshQueue = [];
}

function forceLogout() {
  removeToken();
  sessionStorage.setItem("mobpae_session_expired", "1");
  window.location.replace("/login");
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const requestUrl: string = originalRequest?.url ?? "";
    const is401 = error.response?.status === 401;

    // Don't intercept auth endpoints — wrong creds should just bubble up as errors
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (!is401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in flight — queue this request until it settles
      return new Promise((resolve, reject) => {
        refreshQueue.push({ originalRequest, resolve, reject });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { headers: { "Content-Type": "application/json" }, timeout: 20_000 }
      );

      if (getTokenRole(data.accessToken) !== "ADMIN") {
        throw new Error("This account does not have access to the Admin portal.");
      }

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      resolveQueue(data.accessToken);
      return api(originalRequest);
    } catch (refreshErr) {
      rejectQueue(refreshErr);
      forceLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
