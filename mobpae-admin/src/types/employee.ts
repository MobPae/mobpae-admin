export type EmploymentStatus = "ACTIVE" | "INACTIVE";
export type SelfieStatus = "PENDING" | "VERIFIED" | "REJECTED";

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
  // KYC / profile
  kycStatus?: string;
  profilePhotoUrl?: string;
  selfieStatus?: SelfieStatus;
  selfieUrl?: string;
  selfieVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: string;
    companyName: string;
    companyCode: string;
    status: string;
  };
}
