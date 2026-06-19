import api from "../lib/axios";
import type { AdminDashboard, RevenueSummary } from "../types/dashboard";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get("/reports/dashboard");
  // Unwrap if backend wraps in { data: ... }
  const raw = (response.data && typeof response.data === "object" && "data" in (response.data as object))
    ? (response.data as Record<string, unknown>).data as Record<string, unknown>
    : response.data as Record<string, unknown>;
  const n = (v: unknown): number => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  return {
    totalEmployers:       n(raw.totalEmployers),
    activeEmployers:      n(raw.activeEmployers),
    totalEmployees:       n(raw.totalEmployees),
    activeEmployees:      n(raw.activeEmployees),
    pendingKycDocuments:  n(raw.pendingKycDocuments ?? raw.pendingKyc),
    pendingBankAccounts:  n(raw.pendingBankAccounts ?? raw.pendingBanks),
    pendingSalaryRequests:n(raw.pendingSalaryRequests ?? raw.pendingRequests),
    pendingDisbursals:    n(raw.pendingDisbursals),
    disbursedAmount:      n(raw.disbursedAmount ?? raw.totalDisbursed),
    recoveredAmount:      n(raw.recoveredAmount ?? raw.totalRecovered),
    outstandingAmount:    n(raw.outstandingAmount ?? raw.totalOutstanding),
    pendingSettlements:   n(raw.pendingSettlements),
    membershipRevenue:    n(raw.membershipRevenue),
    activeMemberships:    n(raw.activeMemberships),
    activeRepayments:     n(raw.activeRepayments),
  };
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
