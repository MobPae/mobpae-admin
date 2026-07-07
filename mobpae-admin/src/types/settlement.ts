export type EmployerSettlementStatus = "NO_DUES" | "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export interface SettlementRepayment {
  id: string;
  loanApplicationId: string;
  principalAmount: string;
  interestAmount: string;
  totalAmount: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
  loanApplication?: {
    id: string;
    applicationNumber?: string | null;
    employee?: {
      id: string;
      name: string;
      employeeCode: string;
      email: string;
    } | null;
  } | null;
}

export interface EmployerSettlement {
  id: string;
  employerId: string;
  payrollMonth: string;
  principalAmount: string;
  interestAmount: string;
  lateFeeAmount: string;
  totalAmount: string;
  outstandingAmount: string;
  dueDate: string;
  gracePeriodEnd: string | null;
  paidDate: string | null;
  status: EmployerSettlementStatus;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  repayments?: SettlementRepayment[];
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    riskStatus: string;
  };
}
