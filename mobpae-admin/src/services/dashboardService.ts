import api from "../lib/axios";
import type { AdminDashboard, RevenueSummary } from "../types/dashboard";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>("/dashboard/admin");
  return response.data;
}

// GET /membership/revenue-summary
export async function getRevenueSummary(): Promise<RevenueSummary> {
  const response = await api.get("/membership/revenue-summary");
  const raw = (response.data && typeof response.data === "object")
    ? (response.data as Record<string, unknown>)
    : {};
  // Unwrap if nested
  const data: Record<string, unknown> = (raw.data && typeof raw.data === "object")
    ? (raw.data as Record<string, unknown>)
    : raw;
  return {
    membershipRevenue: data.membershipRevenue ?? data.membership_revenue ?? 0,
    interestRevenue:   data.interestRevenue   ?? data.interest_revenue   ?? 0,
    totalRevenue:      data.totalRevenue      ?? data.total_revenue      ?? 0,
  };
}
