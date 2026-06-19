import api from "../lib/axios";
import type { Employee } from "../types/employee";

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get("/employees");
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as Employee[]);
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await api.get<Employee>(`/employees/${employeeId}`);
  return response.data;
}

export async function verifySelfie(employeeId: string): Promise<void> {
  await api.post(`/employees/${employeeId}/selfie/verify`);
}

export async function rejectSelfie(employeeId: string, remarks: string): Promise<void> {
  await api.post(`/employees/${employeeId}/selfie/reject`, { remarks });
}
