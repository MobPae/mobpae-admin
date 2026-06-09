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

export async function approveSalaryRequestForDisbursal(salaryRequestId: string) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/disbursals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ salaryRequestId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to approve salary request");
  }

  return response.json();
}

export async function disburseSalaryRequest(disbursalId: string) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/disbursals/${disbursalId}/disburse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to disburse salary request");
  }

  return response.json();
}
