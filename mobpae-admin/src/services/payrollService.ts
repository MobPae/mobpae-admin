// Payroll service — admin portal
import api from "../lib/axios";

/**
 * POST /payroll/process-recovery/:employerId
 * Generates a settlement for due recoveries.
 * Linked recoveries are completed only after the settlement is marked paid.
 */
export async function processRecovery(employerId: string): Promise<void> {
  await api.post(`/payroll/process-recovery/${employerId}`);
}
