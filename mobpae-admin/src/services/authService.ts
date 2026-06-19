import api from "../lib/axios";
import { removeToken } from "../utils/auth";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    role: string;
    passwordChanged?: boolean;
  };
  /** Legacy flat field — some older responses may still include this */
  role?: string;
  passwordChanged?: boolean;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>("/auth/refresh", { refreshToken });
  return response.data;
}

export async function logout(): Promise<void> {
  try { await api.post("/auth/logout"); } catch { /* best-effort */ }
  removeToken();
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}
