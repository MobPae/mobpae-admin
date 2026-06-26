export type EmployerStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
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
  totalEmployees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployerPayload {
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  payrollDate: number;
  payrollCutoffDate: number;
  employerEnquiryId?: string; // links the new employer to its source lead
}

// Backend may optionally return login credentials in the create response
export interface CreateEmployerResponse extends Employer {
  loginEmail?: string;
  temporaryPassword?: string;
}

// PATCH /employers/:id/status response
export interface ActivateEmployerResponse {
  emailDelivered: boolean;
  temporaryPassword?: string;
}
