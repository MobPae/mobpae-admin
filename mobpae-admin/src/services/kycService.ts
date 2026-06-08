const API_BASE_URL = "http://localhost:3000";

export type KycStatusFilter = "PENDING" | "VERIFIED" | "REJECTED" | "ALL";

export async function getKycDocuments(status: KycStatusFilter = "PENDING") {
  const token = localStorage.getItem("accessToken");
  const query = status === "ALL" ? "" : `?status=${status}`;

  try {
    const response = await fetch(`${API_BASE_URL}/kyc-documents${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export function getPendingKycDocuments() {
  return getKycDocuments("PENDING");
}

async function updateKycStatus(documentId: string, action: "verify" | "reject") {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/kyc-documents/${documentId}/${action}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to ${action} KYC document`);
  }

  return response.json();
}

export function verifyKycDocument(documentId: string) {
  return updateKycStatus(documentId, "verify");
}

export function rejectKycDocument(documentId: string) {
  return updateKycStatus(documentId, "reject");
}
