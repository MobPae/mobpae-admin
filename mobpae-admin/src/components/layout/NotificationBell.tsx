import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "../../services/notificationService";
import { useEscKey } from "../../lib/useEscKey";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function typeAccent(type: string | null) {
  switch (type) {
    case "ALERT":   return "bg-danger-bg text-danger";
    case "SUCCESS": return "bg-success-bg text-success";
    case "WARNING": return "bg-warning-bg text-warning";
    default:        return "bg-brand-soft text-brand";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: unread = 0 } = useQuery<number>({
    queryKey: ["notifications-count"],
    queryFn: getNotificationCount,
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading, isError, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications-me"],
    queryFn: getMyNotifications,
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-me"] });
      void qc.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-me"] });
      void qc.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  useEscKey(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-ink-3 transition-colors hover:bg-brand-soft hover:text-brand"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-edge bg-surface shadow-overlay"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-danger-soft px-1.5 py-0.5 text-[11px] font-bold text-danger">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  title="Mark all as read"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-50"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] divide-y divide-edge-2 overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center" role="status">
                <p className="text-sm font-medium text-ink-3">Loading notifications…</p>
              </div>
            ) : isError ? (
              <div className="px-4 py-8 text-center" role="alert">
                <p className="text-sm font-semibold text-danger">Notifications could not be loaded</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 h-8 rounded-lg border border-edge px-3 text-xs font-semibold text-ink-3 transition-colors hover:bg-canvas"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="mx-auto mb-2 text-ink-4" />
                <p className="text-sm font-medium text-ink-3">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  className={`flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-surface-raised ${!n.isRead ? "bg-brand-soft/40" : ""}`}
                  onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                >
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${typeAccent(n.type)}`}>
                    {(n.type ?? "SYS").slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12px] leading-snug ${!n.isRead ? "font-bold text-ink" : "font-medium text-ink-3"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-3">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-4">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={e => { e.stopPropagation(); markRead.mutate(n.id); }}
                      title="Mark as read"
                      aria-label={`Mark ${n.title} as read`}
                      className="mt-1 flex-shrink-0 text-ink-4 transition-colors hover:text-brand"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
