import api from "../lib/axios";

export interface LoginResponse {
  accessToken: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}
