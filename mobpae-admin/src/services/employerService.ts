import api from "../lib/axios";
import type { ActivateEmployerResponse, CreateEmployerPayload, CreateEmployerResponse, Employer } from "../types/employer";

export interface EmployerProductConfig {
  id: string;
  productId: string;
  maximumAdvanceAmountOverride: number | null;
  requiresEmployerApproval: boolean;
  isEnabled: boolean;
  product: { productType: string; name: string };
}

export async function getEmployers(): Promise<Employer[]> {
  const response = await api.get("/employers");
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as Employer[]);
}

export async function getEmployer(employerId: string): Promise<Employer> {
  const response = await api.get<Employer>(`/employers/${employerId}`);
  return response.data;
}

export async function createEmployer(payload: CreateEmployerPayload): Promise<CreateEmployerResponse> {
  const response = await api.post<CreateEmployerResponse>("/employers", payload);
  return response.data;
}

export async function updateEmployerStatus(
  employerId: string,
  status: Employer["status"]
): Promise<ActivateEmployerResponse> {
  const response = await api.patch<ActivateEmployerResponse>(`/employers/${employerId}/status`, { status });
  return response.data;
}

export async function getEmployerProductConfigs(employerId: string): Promise<EmployerProductConfig[]> {
  const response = await api.get<EmployerProductConfig[]>(`/employers/${employerId}/product-configs`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function upsertEmployerProductConfig(
  employerId: string,
  productType: string,
  payload: { maximumAdvanceAmountOverride?: number | null; requiresEmployerApproval?: boolean; isEnabled?: boolean }
): Promise<EmployerProductConfig> {
  const response = await api.put<EmployerProductConfig>(
    `/employers/${employerId}/product-configs/${productType}`,
    payload
  );
  return response.data;
}
