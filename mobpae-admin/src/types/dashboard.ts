// Matches GET /membership/revenue-summary
export interface RevenueSummary {
  membershipRevenue: string | number;
  interestRevenue: string | number;
  totalRevenue: string | number;
}

// Matches GET /dashboard/admin exactly
export interface AdminDashboard {
  totalEmployers: number;
  activeEmployers: number;
  totalEmployees: number;
  pendingKycDocuments: number;
  pendingSalaryRequests: number;
  pendingDisbursals: number;
  activeRepayments: number;
}

// Matches GET /dashboard/employers/:id exactly
export interface EmployerDashboard {
  totalEmployees: number;
  activeEmployees: number;
  appActivatedEmployees: number;
  pendingSalaryRequests: number;
  approvedRequests: number;
  outstandingAmount: number;
}
