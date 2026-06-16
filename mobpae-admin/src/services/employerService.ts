import api from "../lib/axios";
import type { CreateEmployerPayload, CreateEmployerResponse, Employer } from "../types/employer";

export async function getEmployers(): Promise<Employer[]> {
  const response = await api.get<Employer[]>("/employers");
  return response.data;
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
): Promise<Employer> {
  const response = await api.patch<Employer>(`/employers/${employerId}/status`, { status });
  return response.data;
}
