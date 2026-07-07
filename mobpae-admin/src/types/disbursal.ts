export type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";

export interface Disbursal {
  id: string;
  loanApplicationId: string;
  disbursedAmount: string;
  disbursedBy: string | null;
  disbursedAt: string | null;
  status: DisbursalStatus;
  remarks: string | null;
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
