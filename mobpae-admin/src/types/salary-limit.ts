export interface SalaryLimit {
  id: string;
  employeeId: string;
  approvedLimit: string;
  maxRequestsPerCycle: number;
  cooldownDays: number;
  createdAt: string;
  updatedAt: string;
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
