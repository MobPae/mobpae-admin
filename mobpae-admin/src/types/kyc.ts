export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type KycDocumentType = "AADHAR" | "PAN" | "SALARY_SLIP" | "OTHER";

/** Flat document — used by legacy flat listing */
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

/** Single document inside a grouped-by-employee response */
export interface KycGroupedDocument {
  id: string;
  documentType: KycDocumentType;
  filePath: string;
  status: KycStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One row in the GET /kyc/grouped-by-employee response */
export interface KycEmployeeGroup {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  companyName: string;
  employerId?: string;
  overallStatus: KycStatus | "NOT_SUBMITTED";
  submittedCount: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  documents: KycGroupedDocument[];
}
