export type EmployerStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "SUSPENDED";
export type EmployerRiskStatus = "GOOD" | "WARNING" | "BLOCKED";

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  payrollDate: number;
  payrollCutoffDate: number;
  status: EmployerStatus;
  riskStatus: EmployerRiskStatus;
  createdAt: string;
  updatedAt: string;
}
