import api from "../lib/axios";
import type { BankAccount, BankEmployerGroup } from "../types/bankAccount";

export type BankVerificationFilter = "PENDING" | "VERIFIED" | "ALL";

/** Legacy flat list */
export async function getBankAccounts(filter: BankVerificationFilter = "ALL"): Promise<BankAccount[]> {
  const params = filter !== "ALL" ? { verified: filter === "VERIFIED" } : {};
  const response = await api.get<BankAccount[]>("/bank-accounts", { params });
  return Array.isArray(response.data) ? response.data : [];
}

/** Grouped by employer — primary admin view */
export async function getBankGroupedByEmployer(params?: {
  status?: BankVerificationFilter;
}): Promise<BankEmployerGroup[]> {
  const queryParams =
    params?.status && params.status !== "ALL"
      ? { verified: params.status === "VERIFIED" }
      : {};
  const response = await api.get<BankEmployerGroup[]>("/bank-accounts/grouped-by-employer", {
    params: queryParams,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function verifyBankAccount(accountId: string): Promise<void> {
  await api.post(`/bank-accounts/${accountId}/verify`);
}
