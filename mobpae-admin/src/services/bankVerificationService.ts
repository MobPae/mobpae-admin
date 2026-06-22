import api from "../lib/axios";
import type { BankAccount, BankEmployerGroup } from "../types/bankAccount";

export type BankVerificationFilter = "PENDING" | "VERIFIED" | "ALL";

function unwrapList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "items", "results"]) {
      if (Array.isArray(r[key])) return r[key] as T[];
    }
  }
  return [];
}

/** Flat bank-account list from GET /bank-accounts */
export async function getBankAccounts(filter: BankVerificationFilter = "ALL"): Promise<BankAccount[]> {
  const params = filter !== "ALL" ? { verified: filter === "VERIFIED" } : {};
  const response = await api.get("/bank-accounts", { params });
  return unwrapList<BankAccount>(response.data, ["bankAccounts", "accounts"]);
}

/** Group a flat BankAccount[] by employer client-side */
function groupByEmployer(accounts: BankAccount[]): BankEmployerGroup[] {
  const map = new Map<string, BankEmployerGroup>();

  for (const account of accounts) {
    const emp = account.employee?.employer;
    if (!emp?.id) continue;

    let group = map.get(emp.id);
    if (!group) {
      group = {
        employerId:    emp.id,
        companyName:   emp.companyName,
        companyCode:   emp.companyCode,
        totalAccounts: 0,
        pendingCount:  0,
        verifiedCount: 0,
        accounts:      [],
      };
      map.set(emp.id, group);
    }

    group.accounts.push(account);
    group.totalAccounts += 1;
    if (account.verified) group.verifiedCount += 1;
    else group.pendingCount += 1;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.companyName.localeCompare(b.companyName)
  );
}

/**
 * Grouped by employer — primary admin view.
 * Always uses GET /bank-accounts and groups client-side.
 * /bank-accounts/pending-by-employer only returns pending counts, not full account data.
 */
export async function getBankGroupedByEmployer(params?: {
  status?: BankVerificationFilter;
}): Promise<BankEmployerGroup[]> {
  const accounts = await getBankAccounts(params?.status ?? "ALL");
  return groupByEmployer(accounts);
}

/**
 * Per-employer drill-down — filters the full /bank-accounts response by employer.
 * Avoids /bank-accounts/pending-by-employer/:id which only returns pending counts.
 */
export async function getBankAccountsByEmployer(employerId: string): Promise<BankAccount[]> {
  const all = await getBankAccounts("ALL");
  return all.filter(a => a.employee?.employer?.id === employerId);
}

export async function verifyBankAccount(accountId: string): Promise<void> {
  await api.post(`/bank-accounts/${accountId}/verify`);
}

export async function rejectBankAccount(accountId: string): Promise<void> {
  await api.post(`/bank-accounts/${accountId}/reject`);
}
