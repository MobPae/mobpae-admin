export type PayrollRecoveryStatus = "PENDING" | "PARTIAL" | "RECOVERED" | "WRITTEN_OFF";

export interface PayrollSummary {
  employerId: string;
  companyName: string;
  companyCode: string;
  /** ISO DateTime of first day of payroll recovery month */
  cycleDate: string;
  totalDisbursed: string;
  totalRepaid: string;
  totalOutstanding: string;
  employeeCount: number;
  activeAdvanceCount: number;
}

export interface PayrollRecovery {
  id: string;
  employerId: string;
  /** ISO DateTime of first day of payroll recovery month */
  cycleDate: string;
  totalSalaryDisbursed: string;
  totalAdvanceOutstanding: string;
  totalRecovered: string;
  recoveryPercent: number;
  status: PayrollRecoveryStatus;
  notes: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    riskStatus: string;
  };
}
