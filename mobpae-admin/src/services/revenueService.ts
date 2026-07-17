import api from "../lib/axios";
import type { RevenueReport, RevenueReportFilters } from "../types/revenue";

/** GET /reports/revenue — realized revenue (paid platform fees, paid repayment interest, paid settlement late fees), grouped by employer and employee. */
export async function getRevenueReport(filters?: RevenueReportFilters): Promise<RevenueReport> {
  const params: Record<string, string> = {};
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate)   params.endDate   = filters.endDate;

  const response = await api.get("/reports/revenue", { params });
  const raw = response.data as Record<string, unknown>;
  return (raw && typeof raw === "object" && "data" in raw
    ? raw.data
    : raw) as RevenueReport;
}
