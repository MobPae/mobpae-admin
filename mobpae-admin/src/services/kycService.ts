import api from "../lib/axios";
import type { KycDocument } from "../types/kyc";

export type KycStatusFilter = "PENDING" | "VERIFIED" | "REJECTED" | "ALL";

export async function getKycDocuments(status: KycStatusFilter = "PENDING"): Promise<KycDocument[]> {
  const params = status !== "ALL" ? { status } : {};
  const response = await api.get<KycDocument[]>("/kyc-documents", { params });
  return response.data;
}

export function getPendingKycDocuments(): Promise<KycDocument[]> {
  return getKycDocuments("PENDING");
}

export async function verifyKycDocument(documentId: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/verify`);
}

export async function rejectKycDocument(documentId: string): Promise<void> {
  await api.post(`/kyc-documents/${documentId}/reject`);
}
