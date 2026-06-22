import api from "../lib/axios";
import type { Repayment } from "../types/repayment";

function unwrapList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "items", "results", "records"]) {
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

/** GET /repayments — Admin: all repayments across all employees */
export async function getRepayments(): Promise<Repayment[]> {
  const response = await api.get("/repayments");
  return unwrapList<Repayment>(response.data, ["repayments"]);
}

/** GET /repayments/:id — not exposed by backend; use getRepayments + find client-side */
export async function getRepayment(repaymentId: string): Promise<Repayment> {
  const all = await getRepayments();
  const found = all.find((r) => r.id === repaymentId);
  if (!found) throw new Error(`Repayment ${repaymentId} not found`);
  return found;
}

/** POST /repayments/:id/pay — Admin: mark repayment as paid */
export async function markRepaymentPaid(repaymentId: string): Promise<Repayment> {
  const response = await api.post(`/repayments/${repaymentId}/pay`);
  return unwrapItem<Repayment>(response.data, ["repayment"]);
}
