import api from "../lib/axios";
import type { BankAccount } from "../types/bankAccount";

export type BankVerificationFilter = "PENDING" | "VERIFIED" | "ALL";

export async function getBankAccounts(filter: BankVerificationFilter = "ALL"): Promise<BankAccount[]> {
  const params = filter !== "ALL" ? { verified: filter === "VERIFIED" } : {};
  const response = await api.get<BankAccount[]>("/bank-accounts", { params });
  return response.data;
}

export async function verifyBankAccount(accountId: string): Promise<void> {
  await api.post(`/bank-accounts/${accountId}/verify`);
}
