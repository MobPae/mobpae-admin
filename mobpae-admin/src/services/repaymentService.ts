import api from "../lib/axios";
import type { Repayment } from "../types/repayment";

export async function getRepayments(): Promise<Repayment[]> {
  const response = await api.get<Repayment[]>("/repayments");
  return response.data;
}

export async function getRepayment(repaymentId: string): Promise<Repayment> {
  const response = await api.get<Repayment>(`/repayments/${repaymentId}`);
  return response.data;
}
