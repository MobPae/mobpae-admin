export type DisbursalStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Disbursal {
  id: string;
  loanApplicationId: string;
  disbursedAmount: string;
  requestedAmount: string | null;
  approvedAmount: string | null;
  disbursedBy: string | null;
  initiatedBy: string | null;
  /** Completed (success or fail) timestamp */
  completedAt: string | null;
  initiatedAt: string | null;
  status: DisbursalStatus;
  remarks: string | null;
  failureReason: string | null;
  providerReference: string | null;
  paymentProvider: string | null;
  /** Bank snapshot fields frozen at disbursal time */
  disbursalAccountNumber: string | null;
  disbursalIfscCode: string | null;
  disbursalBankName: string | null;
  disbursalAccountHolderName: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  loanApplication: {
    id: string;
    applicationNumber: string;
    requestedAmount: string;
    adminApprovedAmount: string | null;
    status: string;
    employee: {
      id: string;
      employeeCode: string;
      name: string;
      email: string;
      employer: {
        id: string;
        companyName: string;
        companyCode: string;
        status: string;
      };
    };
  };
}
