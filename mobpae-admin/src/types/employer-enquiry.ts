export type EmployerEnquiryStatus = "NEW" | "CONTACTED" | "APPROVED" | "REJECTED";

export type EmployerEnquiry = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  employeeCount: number | null;
  status: EmployerEnquiryStatus;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};
