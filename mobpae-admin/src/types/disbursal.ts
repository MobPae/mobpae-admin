export interface Disbursal {
  id: string;
  amount: number;
  status: string;
  disbursedAt: string;

  salaryRequest: {
    id: string;
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
