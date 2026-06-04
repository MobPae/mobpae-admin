export interface KycDocument {
  id: string;

  documentType: string;

  filePath: string;

  status: string;

  verifiedAt?: string;

  createdAt: string;

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
