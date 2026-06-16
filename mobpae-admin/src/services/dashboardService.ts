import api from "../lib/axios";
import type { AdminDashboard } from "../types/dashboard";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>("/dashboard/admin");
  return response.data;
}
