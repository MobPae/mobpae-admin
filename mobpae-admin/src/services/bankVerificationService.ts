const API_BASE_URL = "http://localhost:3000";

export async function getBankAccounts() {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
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
