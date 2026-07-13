export type EmployerSettlementStatus =
  | "DRAFT"
  | "GENERATED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

/** Line item: frozen snapshot per employee per settlement */
export interface SettlementLineItem {
  id: string;
  settlementId: string;
  repaymentId: string;
  loanApplicationId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  loanApplicationNumber: string;
  principalAmount: string;
  interestAmount: string;
  processingFee: string;
  gstAmount: string;
  totalDeductionAmount: string;
  status: "INCLUDED" | "EXCLUDED" | "ADJUSTED";
  remarks: string | null;
  snapshotCreatedAt: string;
}

/** @deprecated Use SettlementLineItem */
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
  /** Settlement number, e.g. MPS-LTIM-202607-0001 */
  settlementNumber: string;
  /** ISO DateTime of first day of payroll recovery month */
  cycleDate: string;
  principalAmount: string;
  interestAmount: string;
  lateFeeAmount: string;
  processingFeeAmount: string;
  gstAmount: string;
  totalAmount: string;
  outstandingAmount: string;
  employeeCount: number;
  dueDate: string;
  gracePeriodEnd: string | null;
  paidDate: string | null;
  generatedAt: string | null;
  generatedBy: string | null;
  status: EmployerSettlementStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems?: SettlementLineItem[];
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    riskStatus: string;
  };
}
