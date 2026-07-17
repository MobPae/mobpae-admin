export interface RevenueEmployeeBucket {
  employeeId: string;
  name: string;
  employeeCode: string;
  interestRevenue: number;
  platformFeeRevenue: number;
  /** Always 0 — late fees are recorded at the employer level only, never per employee. */
  lateFeeRevenue: number;
  totalRevenue: number;
}

export interface RevenueEmployerBucket {
  employerId: string;
  companyName: string;
  companyCode: string;
  interestRevenue: number;
  platformFeeRevenue: number;
  lateFeeRevenue: number;
  totalRevenue: number;
  employeeCount: number;
  employees: RevenueEmployeeBucket[];
}

/** GET /reports/revenue */
export interface RevenueReport {
  totalRevenue: number;
  interestRevenue: number;
  platformFeeRevenue: number;
  lateFeeRevenue: number;
  byEmployer: RevenueEmployerBucket[];
}

export interface RevenueReportFilters {
  /** Inclusive. YYYY-MM-DD or ISO datetime. */
  startDate?: string;
  /** Inclusive. YYYY-MM-DD or ISO datetime. */
  endDate?: string;
}
