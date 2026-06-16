import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
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
// Guard: only redirect once per expired-session, not once per parallel in-flight request.
let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? "";
    const is401 = error.response?.status === 401;

    // Don't treat a bad-credentials response from the login endpoint as "session expired".
    const isAuthEndpoint = requestUrl.includes("/auth/login");

    if (is401 && !isAuthEndpoint && !redirectingToLogin) {
      redirectingToLogin = true;
      removeToken();
      // Use replace so the login page doesn't end up in browser history.
      window.location.replace("/login");
      // Reset flag after navigation completes so a fresh login session works.
      setTimeout(() => { redirectingToLogin = false; }, 3000);
    }

    return Promise.reject(error);
  }
);

export default api;
