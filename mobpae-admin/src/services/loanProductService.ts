import api from "../lib/axios";

export interface EligibilityRules {
  /** Interest-free cap as % of salary, e.g. 10 = 10% */
  platformAdvancePercentage: number;
  /** Absolute ₹ ceiling for the platform cap, e.g. 5000 */
  platformMaxAdvanceAmount: number;
  /** Hard ceiling as % of salary — never exceeded even with employer override */
  hardCeilingPercentage: number;
  minimumAdvanceAmount: number;
  minimumSalaryInHand: number;
  minimumTenureMonths: number;
  requiresKyc: boolean;
  requiresMembership: boolean;
  requiresBankAccount: boolean;
  requiresActiveSelfie: boolean;
  maxRequestsPerCycle: number;
  cooldownDays: number;
}

export interface PricingRules {
  annualInterestRate: number;
  processingFeeRate: number;
  gstRate: number;
}

export interface OperationalRules {
  requiresEmployerApproval: boolean;
  requiresAdminApproval: boolean;
  minDisbursalDays: number;
  maxDisbursalDays: number;
  defaultFundingSource: "MOBPAE" | "EMPLOYER" | "PARTNER";
}

export interface LoanProductConfig {
  id: string;
  productId: string;
  versionNumber: number;
  versionName: string | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  eligibilityRules: EligibilityRules;
  pricingRules: PricingRules;
  operationalRules: OperationalRules;
  createdBy: string;
  createdAt: string;
}

export interface CreateConfigPayload {
  versionName?: string;
  effectiveFrom: string;
  eligibilityRules: EligibilityRules;
  pricingRules: PricingRules;
  operationalRules: OperationalRules;
}

export async function getActiveConfig(productType = "SA"): Promise<LoanProductConfig> {
  const r = await api.get<LoanProductConfig>(`/loan-products/${productType}/config/active`);
  return r.data;
}

export async function getConfigHistory(productType = "SA"): Promise<LoanProductConfig[]> {
  const r = await api.get<LoanProductConfig[]>(`/loan-products/${productType}/config/history`);
  return Array.isArray(r.data) ? r.data : [];
}

export async function publishConfigVersion(productType = "SA", payload: CreateConfigPayload): Promise<LoanProductConfig> {
  const r = await api.post<LoanProductConfig>(`/loan-products/${productType}/config`, payload);
  return r.data;
}

export async function deleteConfigVersion(productType = "SA", id: string): Promise<void> {
  await api.delete(`/loan-products/${productType}/config/${id}`);
}
