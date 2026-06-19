// Matches GET /membership/revenue-summary
export interface RevenueSummary {
  membershipRevenue: string | number;
  interestRevenue: string | number;
  totalRevenue: string | number;
}

// Matches GET /reports/dashboard
export interface AdminDashboard {
  // Employer totals
  totalEmployers: number;
  activeEmployers: number;
  // Employee totals
  totalEmployees: number;
  activeEmployees: number;
  // Pending queues
  pendingKycDocuments: number;
  pendingBankAccounts: number;
  pendingSalaryRequests: number;
  pendingDisbursals: number;
  // Financial
  disbursedAmount: number;
  recoveredAmount: number;
  outstandingAmount: number;
  // Settlements
  pendingSettlements: number;
  // Membership
  membershipRevenue: number;
  activeMemberships: number;
  // Legacy (kept for backward compat with older backend)
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
