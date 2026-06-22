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

export async function getNotificationCount(): Promise<number> {
  const response = await api.get("/notifications/me/count");
  const data = response.data as Record<string, unknown>;
  return typeof data.unread === "number" ? data.unread : 0;
}
