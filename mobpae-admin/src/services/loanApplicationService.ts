import api from "../lib/axios";
import type { LoanApplication, PlatformFee } from "../types/loan-application";

const PAGE_LIMIT = 100;

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of ["data", "items", "results", "records"]) {
      if (Array.isArray(r[key])) return r[key] as T[];
    }
  }
  return [];
}

export interface LoanApplicationFilters {
  status?: string;
  employerId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getLoanApplications(filters?: LoanApplicationFilters): Promise<LoanApplication[]> {
  const params: Record<string, string> = { limit: String(PAGE_LIMIT), page: "1" };
  if (filters?.status)     params.status     = filters.status;
  if (filters?.employerId) params.employerId = filters.employerId;
  if (filters?.employeeId) params.employeeId = filters.employeeId;
  if (filters?.startDate)  params.startDate  = filters.startDate;
  if (filters?.endDate)    params.endDate    = filters.endDate;

  const all: LoanApplication[] = [];
  let page = 1;

  while (true) {
    const response = await api.get("/loan-applications", { params: { ...params, page: String(page) } });
    const batch = unwrapList<LoanApplication>(response.data);
    all.push(...batch);

    const raw = response.data as Record<string, unknown>;
    const total = typeof raw?.total === "number" ? raw.total : null;

    if (batch.length < PAGE_LIMIT) break;
    if (total !== null && all.length >= total) break;
    page += 1;
  }

  return all;
}

export async function getLoanApplication(id: string): Promise<LoanApplication> {
  const response = await api.get<LoanApplication>(`/loan-applications/${id}`);
  return response.data;
}

export async function getLoanApplicationsByEmployee(employeeId: string): Promise<LoanApplication[]> {
  const response = await api.get(`/loan-applications/employee/${employeeId}`);
  return unwrapList<LoanApplication>(response.data);
}

export async function getLoanApplicationsByEmployer(employerId: string, limit = 10): Promise<LoanApplication[]> {
  const response = await api.get("/loan-applications", {
    params: { employerId, limit: String(limit), page: "1" },
  });
  return unwrapList<LoanApplication>(response.data);
}

export async function adminApproveLoanApplication(id: string): Promise<LoanApplication> {
  const response = await api.post<LoanApplication>(`/loan-applications/${id}/admin-approve`);
  return response.data;
}

export async function adminRejectLoanApplication(id: string, reason: string): Promise<LoanApplication> {
  const response = await api.post<LoanApplication>(`/loan-applications/${id}/admin-reject`, { reason });
  return response.data;
}

export async function waivePlatformFee(id: string, remarks?: string): Promise<PlatformFee> {
  const response = await api.post<PlatformFee>(
    `/platform-fees/${id}/waive`,
    remarks ? { remarks } : {},
  );
  return response.data;
}
