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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
}

export async function getAuditLogs(params?: AuditLogsParams): Promise<AuditLogsResponse> {
  const response = await api.get<unknown>("/audit-logs", { params });
  const raw = response.data as Record<string, unknown>;
  // Backend returns { data: [], pagination: { page, limit, total, totalPages } }
  const logs = Array.isArray(raw?.data) ? (raw.data as AuditLog[]) : (Array.isArray(raw) ? (raw as AuditLog[]) : []);
  const pagination = (raw?.pagination as AuditLogsResponse["pagination"] | undefined) ?? {
    page:       (params?.page  ?? 1),
    limit:      (params?.limit ?? 20),
    total:      logs.length,
    totalPages: 1,
  };
  return { data: logs, pagination };
}
