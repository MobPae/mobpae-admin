import api from "../lib/axios";

export type AppInfoType =
  | "ABOUT"
  | "PRIVACY_POLICY"
  | "TERMS_CONDITIONS"
  | "HOW_IT_WORKS"
  | "FAQ"
  | "CONTACT"
  | "WHATS_NEW";

export interface AppInformation {
  id: string;
  type: AppInfoType;
  title: string;
  content: string;
  version?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAppInformation(): Promise<AppInformation[]> {
  const { data } = await api.get<AppInformation[]>("/app-information/admin/all");
  return Array.isArray(data) ? data : [];
}

export async function upsertAppInformation(payload: {
  type: AppInfoType;
  title: string;
  content: string;
  version?: string;
  isActive?: boolean;
}): Promise<AppInformation> {
  const { data } = await api.post<AppInformation>("/app-information", payload);
  return data;
}

export async function updateAppInformation(
  id: string,
  payload: Partial<{ title: string; content: string; version: string; isActive: boolean }>,
): Promise<AppInformation> {
  const { data } = await api.patch<AppInformation>(`/app-information/${id}`, payload);
  return data;
}
