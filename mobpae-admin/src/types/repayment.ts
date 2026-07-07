export type RepaymentStatus = "SCHEDULED" | "PAID" | "OVERDUE";

export interface Repayment {
  id: string;
  loanApplicationId: string;
  principalAmount: string;
  totalAmount: string;
  interestAmount: string;
  interestRate: string;
  interestDays: number;
  dueDate: string;
  paidDate: string | null;
  status: RepaymentStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  loanApplication: {
    id: string;
    requestedAmount: string;
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
