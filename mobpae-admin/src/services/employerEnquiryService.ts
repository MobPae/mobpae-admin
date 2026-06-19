import api from "../lib/axios";
import type { EmployerEnquiry } from "../types/employer-enquiry";

export async function getEmployerEnquiries(): Promise<EmployerEnquiry[]> {
  const response = await api.get("/employer-enquiries");
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as EmployerEnquiry[]);
}
