export type EmploymentStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  id: string;
  userId: string | null;
  employerId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  salaryInHand: string;
  joiningDate: string | null;
  employmentStatus: EmploymentStatus;
  appActivated: boolean;
  passwordChanged?: boolean;
  // KYC / profile
  kycStatus?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    status: string;
  };
}
