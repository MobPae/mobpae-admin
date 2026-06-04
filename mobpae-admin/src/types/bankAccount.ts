export interface BankAccount {
  id: string;

  accountHolderName: string;

  accountNumber: string;

  ifscCode: string;

  bankName?: string;

  upiId?: string;

  verified: boolean;

  createdAt: string;

  employee: {
    id: string;

    employeeCode: string;

    name: string;

    email: string;

    status: string;

    employer: {
      id: string;

      companyName: string;

      companyCode: string;

      status: string;
    };
  };
}
