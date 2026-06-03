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

export async function approveEmployerEnquiry(
  enquiryId: string,
  payload: {
    companyCode: string;
    payrollDate: number;
    payrollCutoffDate: number;
  }
) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_BASE_URL}/employer-enquiries/${enquiryId}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to approve employer");
  }

  return response.json();
}
