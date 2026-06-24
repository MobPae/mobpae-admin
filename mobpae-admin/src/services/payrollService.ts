// Payroll service — admin portal
import api from "../lib/axios";

/**
 * POST /payroll/process-recovery/:employerId
 * Processes all due repayments for the employer: marks them paid,
 * creates a settlement, and re-enables employee eligibility.
 */
export async function processRecovery(employerId: string): Promise<void> {
  await api.post(`/payroll/process-recovery/${employerId}`);
}
