import api from "../lib/axios";
import type { Disbursal } from "../types/disbursal";
import type { DisbursalStatus } from "../types/disbursal";

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

export interface DisbursalFilters {
  status?: DisbursalStatus;
  startDate?: string;
  endDate?: string;
  employerId?: string;
  employeeId?: string;
}

export async function getDisbursals(filters?: DisbursalFilters): Promise<Disbursal[]> {
  const params: Record<string, string> = {};
  if (filters?.status)     params.status     = filters.status;
  if (filters?.startDate)  params.startDate  = filters.startDate;
  if (filters?.endDate)    params.endDate    = filters.endDate;
  if (filters?.employerId) params.employerId = filters.employerId;
  if (filters?.employeeId) params.employeeId = filters.employeeId;
  const response = await api.get("/disbursals", { params });
  return unwrapList<Disbursal>(response.data, ["disbursals"]);
}

export async function createDisbursal(loanApplicationId: string): Promise<Disbursal> {
  const response = await api.post("/disbursals", { loanApplicationId });
  return unwrapItem<Disbursal>(response.data, ["disbursal"]);
}

export async function processDisbursal(disbursalId: string): Promise<Disbursal> {
  const response = await api.post(`/disbursals/${disbursalId}/disburse`);
  return unwrapItem<Disbursal>(response.data, ["disbursal"]);
}
