export interface BankAccount {
  id: string;
  employeeId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string | null;
  upiId: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
    employmentStatus: string;
    employer: {
      id: string;
      companyName: string;
      companyCode: string;
      status: string;
    };
  };
}
