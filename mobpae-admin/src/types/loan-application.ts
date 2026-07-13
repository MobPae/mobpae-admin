export type LoanApplicationStatus =
  | "SUBMITTED"
  | "EMPLOYER_APPROVED"
  | "EMPLOYER_REJECTED"
  | "AWAITING_MEMBERSHIP_PAYMENT"
  | "AWAITING_PLATFORM_FEE_PAYMENT"
  | "READY_FOR_DISBURSAL"
  | "DISBURSED"
  | "REPAYMENT_SCHEDULED"
  | "REPAID"
  | "CANCELLED"
  | "EXPIRED";

export type PlatformFeeStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "WAIVED"
  | "FAILED"
  | "EXPIRED";

export interface PlatformFeePaymentOrder {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  providerSignature: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFee {
  id: string;
  loanApplicationId: string;
  employeeId: string;
  employerId: string;
  feeType: "PER_TRANSACTION" | string;
  amount: string | number;
  currency: string;
  status: PlatformFeeStatus;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAt: string | null;
  waivedAt: string | null;
  waivedBy: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  paymentOrders?: PlatformFeePaymentOrder[];
}

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

  // ── Snapshot fields (frozen at submission time) ───────────────────────────
  /** Employee salary-in-hand at submission (₹) */
  snapshotSalaryInHand: string;
  /** Interest-free threshold = min(salary × advance%, platformMax) — below this is free */
  snapshotInterestFreeThreshold: string;
  /** Effective advance percentage used (after employer override) */
  snapshotMaxAdvancePercentage: string;
  /** Annual interest rate applied on amount above threshold */
  snapshotAnnualInterestRate: string;
  disbursal?: {
    id: string;
    disbursedAmount: string;
    status: string;
    completedAt: string | null;
  } | null;
  repayment?: {
    id: string;
    totalAmount: string;
    dueDate: string;
    status: string;
  } | null;
  platformFee?: PlatformFee | null;
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
