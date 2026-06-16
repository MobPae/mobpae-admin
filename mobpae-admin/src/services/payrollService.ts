import api from "../lib/axios";
import type { PayrollRecovery, PayrollSummary } from "../types/payroll";

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

function unwrapItem<T>(data: unknown, keys: string[]): T {
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "item"]) {
      if (r[key] && typeof r[key] === "object") return r[key] as T;
    }
  }
  return data as T;
}

export async function getPayrollRecoveries(): Promise<PayrollRecovery[]> {
  const response = await api.get("/payroll/recoveries");
  return unwrapList<PayrollRecovery>(response.data, ["recoveries", "payrollRecoveries"]);
}

export async function getPayrollSummaries(): Promise<PayrollSummary[]> {
  const response = await api.get("/payroll/summaries");
  return unwrapList<PayrollSummary>(response.data, ["summaries", "payrollSummaries"]);
}

export async function getPayrollRecovery(id: string): Promise<PayrollRecovery> {
  const response = await api.get(`/payroll/recoveries/${id}`);
  return unwrapItem<PayrollRecovery>(response.data, ["recovery", "payrollRecovery"]);
}
