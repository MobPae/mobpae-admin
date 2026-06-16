import api from "../lib/axios";
import type { Employee } from "../types/employee";

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<Employee[]>("/employees");
  return response.data;
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await api.get<Employee>(`/employees/${employeeId}`);
  return response.data;
}
