import api from "../lib/axios";
import type { Disbursal } from "../types/disbursal";

export async function getDisbursals(): Promise<Disbursal[]> {
  const response = await api.get<Disbursal[]>("/disbursals");
  return response.data;
}

export async function getDisbursal(disbursalId: string): Promise<Disbursal> {
  const response = await api.get<Disbursal>(`/disbursals/${disbursalId}`);
  return response.data;
}

export async function createDisbursal(salaryRequestId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>("/disbursals", { salaryRequestId });
  return response.data;
}

export async function processDisbursal(disbursalId: string): Promise<Disbursal> {
  const response = await api.post<Disbursal>(`/disbursals/${disbursalId}/disburse`);
  return response.data;
}
