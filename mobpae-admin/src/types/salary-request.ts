export type SalaryRequestStatus =
  | "SUBMITTED"
  | "EMPLOYER_APPROVED"
  | "EMPLOYER_REJECTED"
  | "AWAITING_MEMBERSHIP_PAYMENT"
  | "READY_FOR_DISBURSAL"
  | "DISBURSED"
  | "REPAYMENT_SCHEDULED"
  | "REPAID";

export interface SalaryRequest {
  id: string;
  amount: string;
  approvedAmount: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  reason: string | null;
  remarks: string | null;
  requestedAt: string;
  repaymentDate: string | null;
  status: SalaryRequestStatus;
  createdAt: string;
  updatedAt: string;
  disbursal?: {
    id: string;
    amount: string;
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
    employer: {
      id: string;
      companyName: string;
      companyCode: string;
    };
  };
}
