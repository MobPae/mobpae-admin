import api from "../lib/axios";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export async function getMyNotifications(): Promise<Notification[]> {
  const response = await api.get("/notifications/me");
  const data = response.data;
  // Backend returns array directly (findByUser, no pagination wrapper)
  if (Array.isArray(data)) return data as Notification[];
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).data))
    return (data as Record<string, unknown[]>).data as Notification[];
  return [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/me/read-all");
}

export async function getNotificationCount(): Promise<number> {
  const response = await api.get("/notifications/me/count");
  const data = response.data as Record<string, unknown>;
  return typeof data.unread === "number" ? data.unread : 0;
}

export type NotificationType = "SYSTEM" | "EMAIL" | "SMS";

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export async function sendNotification(payload: SendNotificationPayload): Promise<void> {
  await api.post("/notifications", payload);
}

export interface AllNotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export async function getAllNotifications(page = 1, limit = 20): Promise<AllNotificationsResponse> {
  const response = await api.get("/notifications", { params: { page, limit } });
  const raw = response.data as Record<string, unknown>;
  if (Array.isArray(raw)) return { data: raw as Notification[], total: raw.length, page: 1, limit };
  return {
    data: (Array.isArray(raw.data) ? raw.data : []) as Notification[],
    total: typeof raw.total === "number" ? raw.total : 0,
    page: typeof raw.page === "number" ? raw.page : page,
    limit: typeof raw.limit === "number" ? raw.limit : limit,
  };
}
