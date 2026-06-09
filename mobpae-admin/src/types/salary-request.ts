export interface SalaryRequest {
  id: string;

  amount: number;
  approvedAmount?: number | null;

  status: string;

  requestedAt: string;
  remarks?: string | null;

  disbursal?: {
    id: string;
    amount: number;
    status: string;
    disbursedAt?: string | null;
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
