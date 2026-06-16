import api from "../lib/axios";
import type { EmployerSettlement } from "../types/settlement";

export async function getSettlements(): Promise<EmployerSettlement[]> {
  const response = await api.get("/employer-settlements");
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.settlements)) return data.settlements;
  if (Array.isArray(data?.employerSettlements)) return data.employerSettlements;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getSettlement(id: string): Promise<EmployerSettlement> {
  const response = await api.get(`/employer-settlements/${id}`);
  const data = response.data;
  return data?.settlement ?? data?.employerSettlement ?? data?.data ?? data;
}

export async function markSettlementPaid(id: string): Promise<EmployerSettlement> {
  const response = await api.post(`/employer-settlements/${id}/mark-paid`);
  const data = response.data;
  return data?.settlement ?? data?.employerSettlement ?? data?.data ?? data;
}
