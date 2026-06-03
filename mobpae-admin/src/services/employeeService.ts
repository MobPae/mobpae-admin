const API_BASE_URL = "http://localhost:3000";

export async function getEmployees() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  return response.json();
}
