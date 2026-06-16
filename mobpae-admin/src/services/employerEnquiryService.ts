import api from "../lib/axios";
import type { EmployerEnquiry } from "../types/employer-enquiry";

export async function getEmployerEnquiries(): Promise<EmployerEnquiry[]> {
  const response = await api.get<EmployerEnquiry[]>("/employer-enquiries");
  return response.data;
}

export async function approveEmployerEnquiry(
  enquiryId: string,
  payload: {
    companyCode: string;
    payrollDate: number;
    payrollCutoffDate: number;
  }
): Promise<void> {
  await api.post(`/employer-enquiries/${enquiryId}/approve`, payload);
}

export async function rejectEmployerEnquiry(enquiryId: string): Promise<void> {
  await api.post(`/employer-enquiries/${enquiryId}/reject`);
}
