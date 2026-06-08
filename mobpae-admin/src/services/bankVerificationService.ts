const API_BASE_URL = "http://localhost:3000";

export type BankVerificationFilter = "PENDING" | "VERIFIED" | "ALL";

export async function getBankAccounts(filter: BankVerificationFilter = "ALL") {
  const token = localStorage.getItem("accessToken");
  const query = filter === "ALL" ? "" : `?verified=${filter === "VERIFIED"}`;

  try {
    const response = await fetch(`${API_BASE_URL}/bank-accounts${query}`, {
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

export async function verifyBankAccount(accountId: string) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/bank-accounts/${accountId}/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify bank account");
  }

  return response.json();
}
