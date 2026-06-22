// Payroll service — admin portal
import { apiClient } from "../lib/api-client";

/**
 * POST /payroll/process-recovery/:employerId
 * Processes all due repayments for the employer: marks them paid,
 * creates a settlement, and re-enables employee eligibility.
 */
export async function processRecovery(employerId: string): Promise<void> {
  await apiClient.post(`/payroll/process-recovery/${employerId}`);
}
