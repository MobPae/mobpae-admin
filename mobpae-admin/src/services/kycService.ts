import api from "../lib/axios";
import type { KycDocument, KycEmployeeGroup } from "../types/kyc";

export type KycStatusFilter = "PENDING" | "VERIFIED" | "REJECTED" | "ALL";

/** Flat list — used for the drawer: fetch all docs for one employee */
export async function getKycDocuments(status?: KycStatusFilter, employeeId?: string): Promise<KycDocument[]> {
  const params: Record<string, string> = {};
  if (status && status !== "ALL") params.status = status;
  if (employeeId) params.employeeId = employeeId;
  const response = await api.get<KycDocument[]>("/kyc-documents", { params });
  return Array.isArray(response.data) ? response.data : [];
}

/** New grouped-by-employee endpoint — primary admin view */
export async function getKycGrouped(params?: {
  employerId?: string;
  status?: string;
}): Promise<KycEmployeeGroup[]> {
  // Try /kyc/grouped-by-employee first, fall back to alias
  try {
    const response = await api.get<KycEmployeeGroup[]>("/kyc/grouped-by-employee", {
      params: {
        ...(params?.employerId ? { employerId: params.employerId } : {}),
        ...(params?.status && params.status !== "ALL" ? { status: params.status } : {}),
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    const response = await api.get<KycEmployeeGroup[]>("/kyc-documents/grouped-by-employee", {
      params: {
        ...(params?.employerId ? { employerId: params.employerId } : {}),
        ...(params?.status && params.status !== "ALL" ? { status: params.status } : {}),
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  }
}

export async function verifyKycDocument(documentId: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/verify`);
}

export async function rejectKycDocument(documentId: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/reject`);
}
