export type EmployerSettlementStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

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
  paidDate: string | null;
  status: EmployerSettlementStatus;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    riskStatus: string;
  };
}
