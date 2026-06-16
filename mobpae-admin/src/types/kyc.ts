export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type KycDocumentType = "AADHAR" | "PAN" | "SALARY_SLIP" | "OTHER";

export interface KycDocument {
  id: string;
  employeeId: string;
  documentType: KycDocumentType;
  filePath: string;
  status: KycStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
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
      status: string;
    };
  };
}
