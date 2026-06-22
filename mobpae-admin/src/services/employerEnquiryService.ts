import api from "../lib/axios";
import type { EmployerEnquiry, EmployerEnquiryStatus } from "../types/employer-enquiry";

function unwrapItem<T>(data: unknown, keys: string[]): T {
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "item"]) {
      if (r[key] && typeof r[key] === "object") return r[key] as T;
    }
  }
  return data as T;
}

export async function getEmployerEnquiries(): Promise<EmployerEnquiry[]> {
  const response = await api.get("/employer-enquiries");
  const raw = response.data;
  return Array.isArray(raw) ? raw : ((raw?.data ?? []) as EmployerEnquiry[]);
}

export async function updateEnquiryStatus(
  id: string,
  status: EmployerEnquiryStatus,
  remarks?: string
): Promise<EmployerEnquiry> {
  const response = await api.patch(`/employer-enquiries/${id}/status`, {
    status,
    ...(remarks ? { remarks } : {}),
  });
  return unwrapItem<EmployerEnquiry>(response.data, ["enquiry", "employerEnquiry"]);
}
