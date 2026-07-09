import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getNotificationCount,
  markNotificationRead,
  type Notification,
} from "../../services/notificationService";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function typeColor(type: string | null) {
  switch (type) {
    case "ALERT":   return "bg-red-100 text-red-600";
    case "SUCCESS": return "bg-[#EEF2FF] text-[#315eff]";
    case "WARNING": return "bg-amber-100 text-amber-600";
    default:        return "bg-[#EEF2FF] text-[#315eff]";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Lightweight badge poll: hits /notifications/me/count every 30s
  const { data: unread = 0 } = useQuery<number>({
    queryKey: ["notifications-count"],
    queryFn: getNotificationCount,
    refetchInterval: 30000,
  });

  // Full list: only fetched when dropdown is open
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

  const markAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => markRead.mutate(n.id));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-xl border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8F9FC] relative transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-[#6B7280]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-[700] flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-50 overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-[700] text-[#111827]">Notifications</h3>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-[700]">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#315eff] hover:bg-[#EEF2FF] transition-colors"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#F3F4F6]">
            {isLoading ? (
              <div className="py-10 text-center" role="status">
                <p className="text-sm text-[#6B7280] font-[500]">Loading notifications...</p>
              </div>
            ) : isError ? (
              <div className="py-8 px-4 text-center" role="alert">
                <p className="text-sm text-red-600 font-[600]">Notifications could not be loaded</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs font-[600] text-[#6B7280] hover:bg-[#F8F9FC]"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="mx-auto text-[#6B7280] mb-2" />
                <p className="text-sm text-[#6B7280] font-[500]">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-[#F8F9FC] transition-colors cursor-pointer ${!n.isRead ? "bg-[#EEF2FF]/40" : ""}`}
                  onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                >
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-[700] ${typeColor(n.type)}`}>
                    {(n.type ?? "SYS").slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12px] leading-snug ${!n.isRead ? "font-[700] text-[#111827]" : "font-[500] text-[#6B7280]"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#315eff] flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-[#6B7280] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={e => { e.stopPropagation(); markRead.mutate(n.id); }}
                      title="Mark as read"
                      aria-label={`Mark ${n.title} as read`}
                      className="mt-1 flex-shrink-0 text-[#6B7280] hover:text-[#315eff] transition-colors"
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
