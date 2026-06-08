const API_BASE_URL = "http://localhost:3000";

export async function getPendingKycDocuments() {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`${API_BASE_URL}/kyc-documents/pending`, {
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
