const API_BASE_URL = "http://localhost:3000";

export async function getDisbursals() {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`${API_BASE_URL}/disbursals`, {
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
