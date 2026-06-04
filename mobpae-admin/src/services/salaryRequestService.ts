const API_BASE_URL = "http://localhost:3000";

export async function getSalaryRequests() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/salary-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}
