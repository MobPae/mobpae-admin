import api from "../lib/axios";
import type { SalaryRequest } from "../types/salary-request";
import type { Disbursal } from "../types/disbursal";

export async function getSalaryRequests(): Promise<SalaryRequest[]> {
  const response = await api.get<SalaryRequest[]>("/salary-requests");
  return response.data;
}

export async function getSalaryRequest(requestId: string): Promise<SalaryRequest> {
  const response = await api.get<SalaryRequest>(`/salary-requests/${requestId}`);
  return response.data;
}

export async function getSalaryRequestsByEmployee(employeeId: string): Promise<SalaryRequest[]> {
  const response = await api.get<SalaryRequest[]>(`/salary-requests/employee/${employeeId}`);
  return response.data;
}

export async function approveSalaryRequestForDisbursal(salaryRequestId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>("/disbursals", { salaryRequestId });
  return response.data;
}

export async function disburseSalaryRequest(disbursalId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>(`/disbursals/${disbursalId}/disburse`);
  return response.data;
}
