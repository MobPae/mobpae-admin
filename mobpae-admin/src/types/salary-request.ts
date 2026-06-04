export interface SalaryRequest {
  id: string;

  amount: number;

  status: string;

  requestedAt: string;

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
