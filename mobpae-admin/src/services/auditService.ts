import api from "../lib/axios";

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
}

export async function getAuditLogs(params?: AuditLogsParams): Promise<AuditLogsResponse> {
  const response = await api.get<AuditLogsResponse>("/audit-logs", { params });
  // Normalise: some backends return array directly, others return paginated wrapper
  const raw = response.data as unknown;
  if (Array.isArray(raw)) {
    return { data: raw as AuditLog[], total: (raw as AuditLog[]).length, page: 1, limit: (raw as AuditLog[]).length };
  }
  return raw as AuditLogsResponse;
}
