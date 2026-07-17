// Matches GET /reports/dashboard
export interface AdminDashboard {
  // Employer totals
  totalEmployers: number;
  activeEmployers: number;
  pendingEmployers: number;
  // Employee totals
  totalEmployees: number;
  activeEmployees: number;
  // Pending queues
  pendingKycDocuments: number;
  pendingBankAccounts: number;
  pendingLoanApplications: number;
  pendingDisbursals: number;
  // Financial
  disbursedAmount: number;
  recoveredAmount: number;
  outstandingAmount: number;
  // Settlements
  pendingSettlements: number;
  // Legacy (kept for backward compat with older backend)
  activeRepayments: number;
}

// Matches GET /dashboard/employers/:id exactly
export interface EmployerDashboard {
  totalEmployees: number;
  activeEmployees: number;
  appActivatedEmployees: number;
  pendingLoanApplications: number;
  approvedRequests: number;
  outstandingAmount: number;
}
