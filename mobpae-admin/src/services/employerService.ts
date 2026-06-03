const API_BASE_URL = "http://localhost:3000";

export async function getEmployers() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/employers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employers");
  }

  return response.json();
}

export async function updateEmployerStatus(employerId: string, status: string) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_BASE_URL}/employers/${employerId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update employer status");
  }

  return response.json();
}
