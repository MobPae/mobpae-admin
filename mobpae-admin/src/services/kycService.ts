import api from "../lib/axios";
import type { KycDocument, KycEmployeeGroup } from "../types/kyc";

export type KycStatusFilter = "PENDING" | "VERIFIED" | "REJECTED" | "ALL";

function unwrapList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const r = data as Record<string, unknown>;
    for (const key of [...keys, "data", "items", "results", "records"]) {
      if (Array.isArray(r[key])) return r[key] as T[];
    }
  }
  return [];
}

function is404(error: unknown): boolean {
  return (error as { response?: { status?: number } }).response?.status === 404;
}

/** Flat list — used for the drawer: fetch all docs for one employee */
export async function getKycDocuments(
  status?: KycStatusFilter,
  employeeId?: string
): Promise<KycDocument[]> {
  if (employeeId) {
    const response = await api.get(`/kyc-documents/employee/${employeeId}`);
    const documents = unwrapList<KycDocument>(response.data, ["documents", "kycDocuments"]);
    return status && status !== "ALL"
      ? documents.filter((document) => document.status === status)
      : documents;
  }

  const params: Record<string, string> = {};
  if (status && status !== "ALL") params.status = status;
  const response = await api.get("/kyc-documents", { params });
  return unwrapList<KycDocument>(response.data, ["documents", "kycDocuments"]);
}

/** Grouped by employee — primary admin view.
 *  Tries /kyc/grouped-by-employee, falls back to /kyc-documents/grouped-by-employee.
 *  Only the fallback is triggered on a 404; other errors (auth, server) propagate immediately. */
export async function getKycGrouped(params?: {
  employerId?: string;
  status?: string;
}): Promise<KycEmployeeGroup[]> {
  const queryParams = {
    ...(params?.employerId ? { employerId: params.employerId } : {}),
    ...(params?.status && params.status !== "ALL" ? { status: params.status } : {}),
  };

  try {
    const response = await api.get("/kyc/grouped-by-employee", { params: queryParams });
    return unwrapList<KycEmployeeGroup>(response.data, ["groups", "employees", "kycGroups"]);
  } catch (error) {
    // Only fall back on 404 — other errors (401, 500) should surface immediately
    if (!is404(error)) throw error;
  }

  const response = await api.get("/kyc-documents/grouped-by-employee", { params: queryParams });
  return unwrapList<KycEmployeeGroup>(response.data, ["groups", "employees", "kycGroups"]);
}

export async function verifyKycDocument(documentId: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/verify`);
}

export async function rejectKycDocument(documentId: string, note?: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/reject`, { note: note || undefined });
}
