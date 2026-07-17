import api from "../lib/axios";
import type { AdminDashboard } from "../types/dashboard";

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
    pendingEmployers:     n(raw.pendingEmployers),
    totalEmployees:       n(raw.totalEmployees),
    activeEmployees:      n(raw.activeEmployees),
    pendingKycDocuments:  n(raw.pendingKycDocuments ?? raw.pendingKyc),
    pendingBankAccounts:  n(raw.pendingBankVerification ?? raw.pendingBankAccounts ?? raw.pendingBanks),
    pendingLoanApplications:n(raw.pendingLoanApplications ?? raw.pendingSalaryRequests ?? raw.pendingRequests),
    pendingDisbursals:    n(raw.pendingDisbursals),
    disbursedAmount:      n(raw.disbursedAmount ?? raw.totalDisbursed),
    recoveredAmount:      n(raw.recoveredAmount ?? raw.totalRecovered),
    outstandingAmount:    n(raw.outstandingAmount ?? raw.totalOutstanding),
    pendingSettlements:   n(raw.pendingSettlements),
    activeRepayments:     n(raw.activeRepayments),
  };
}
