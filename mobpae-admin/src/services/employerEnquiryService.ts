const API_BASE_URL = "http://localhost:3000";

export async function getEmployerEnquiries() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/employer-enquiries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch enquiries");
  }

  return response.json();
}
