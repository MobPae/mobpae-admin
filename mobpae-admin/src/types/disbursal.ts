export type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";

export interface Disbursal {
  id: string;
  salaryRequestId: string;
  amount: string;
  disbursedBy: string | null;
  disbursedAt: string | null;
  status: DisbursalStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  salaryRequest: {
    id: string;
    amount: string;
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
