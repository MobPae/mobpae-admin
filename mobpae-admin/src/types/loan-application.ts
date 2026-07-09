export type LoanApplicationStatus =
  | "SUBMITTED"
  | "EMPLOYER_APPROVED"
  | "EMPLOYER_REJECTED"
  | "AWAITING_MEMBERSHIP_PAYMENT"
  | "READY_FOR_DISBURSAL"
  | "DISBURSED"
  | "REPAYMENT_SCHEDULED"
  | "REPAID"
  | "CANCELLED"
  | "EXPIRED";

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  requestedAmount: string;
  employerApprovedAmount: string | null;
  adminApprovedAmount: string | null;
  purposeCategory: string;
  purposeNote: string | null;
  remarks: string | null;
  submittedAt: string;
  status: LoanApplicationStatus;
  createdAt: string;
  updatedAt: string;
  disbursal?: {
    id: string;
    disbursedAmount: string;
    status: string;
    disbursedAt: string | null;
  } | null;
  repayment?: {
    id: string;
    totalAmount: string;
    dueDate: string;
    status: string;
  } | null;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
  };
  /** Top-level on the backend response (sibling of employee, not nested inside it) */
  employer?: {
    id: string;
    companyName: string;
    companyCode?: string;
  };
}
