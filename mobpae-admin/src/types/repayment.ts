export interface Repayment {
  id: string;

  amount: number;

  status: string;

  dueDate: string;

  paidAt?: string;

  salaryRequest: {
    id: string;

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
