import api from "../lib/axios";
import type { EmployerEnquiry } from "../types/employer-enquiry";

export async function getEmployerEnquiries(): Promise<EmployerEnquiry[]> {
  const response = await api.get<EmployerEnquiry[]>("/employer-enquiries");
  return response.data;
}
