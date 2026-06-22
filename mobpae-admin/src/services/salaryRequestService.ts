import api from "../lib/axios";
import type { SalaryRequest } from "../types/salary-request";
import type { Disbursal } from "../types/disbursal";

export async function getSalaryRequests(): Promise<SalaryRequest[]> {
  const PAGE_LIMIT = 100;

  const r1 = await api.get("/salary-requests", { params: { limit: PAGE_LIMIT, page: 1 } });
  const raw1 = r1.data as Record<string, unknown>;
  const page1: SalaryRequest[] = Array.isArray(raw1)
    ? (raw1 as SalaryRequest[])
    : ((raw1?.data ?? []) as SalaryRequest[]);

  // If backend returned exactly PAGE_LIMIT rows there may be more — fetch page 2
  if (page1.length < PAGE_LIMIT) return page1;

  const total = typeof raw1?.total === "number" ? raw1.total : null;
  if (total !== null && total <= PAGE_LIMIT) return page1;

  const r2 = await api.get("/salary-requests", { params: { limit: PAGE_LIMIT, page: 2 } });
  const raw2 = r2.data as Record<string, unknown>;
  const page2: SalaryRequest[] = Array.isArray(raw2)
    ? (raw2 as SalaryRequest[])
    : ((raw2?.data ?? []) as SalaryRequest[]);

  return [...page1, ...page2];
}

export async function getSalaryRequest(requestId: string): Promise<SalaryRequest> {
  const response = await api.get<SalaryRequest>(`/salary-requests/${requestId}`);
  return response.data;
}

export async function getSalaryRequestsByEmployee(employeeId: string): Promise<SalaryRequest[]> {
  const response = await api.get(`/salary-requests/employee/${employeeId}`);
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as SalaryRequest[]);
}

export async function getSalaryRequestsByEmployer(employerId: string, limit = 10): Promise<SalaryRequest[]> {
  const response = await api.get("/salary-requests", { params: { employerId, page: 1, limit } });
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as SalaryRequest[]);
}

export async function approveSalaryRequestForDisbursal(salaryRequestId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>("/disbursals", { salaryRequestId });
  return response.data;
}

export async function disburseSalaryRequest(disbursalId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>(`/disbursals/${disbursalId}/disburse`);
  return response.data;
}
