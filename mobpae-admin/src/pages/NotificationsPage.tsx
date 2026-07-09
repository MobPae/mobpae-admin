import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Send, Search, ChevronLeft, ChevronRight, Loader2, BellOff } from "lucide-react";
import { getEmployees } from "../services/employeeService";
import {
  sendNotification,
  getAllNotifications,
  type NotificationType,
} from "../services/notificationService";
import type { Employee } from "../types/employee";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_CONFIG: Record<NotificationType, { label: string; cls: string }> = {
  SYSTEM: { label: "System", cls: "bg-[#DBEAFE] text-[#1D4ED8]" },
  EMAIL:  { label: "Email",  cls: "bg-amber-50 text-amber-700" },
  SMS:    { label: "SMS",    cls: "bg-[#DCFCE7] text-[#15803D]" },
};

// ── component ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const qc = useQueryClient();

  // ── form state ──────────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [title,    setTitle]    = useState("");
  const [message,  setMessage]  = useState("");
  const [type,     setType]     = useState<NotificationType>("SYSTEM");

  // ── pagination for log ──────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // ── data ────────────────────────────────────────────────────────────────────
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: getEmployees,
    staleTime: 120_000,
  });

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ["all-notifications", page],
    queryFn: () => getAllNotifications(page, LIMIT),
    staleTime: 30_000,
  });

  const notifications = notifData?.data ?? [];
  const totalPages    = notifData ? Math.ceil(notifData.total / LIMIT) : 1;

  // ── filtered employee dropdown ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return employees.slice(0, 8);
    const q = search.toLowerCase();
    return employees
      .filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.employeeCode ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [employees, search]);

  // ── mutation ─────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      toast.success("Notification sent", {
        description: `Sent to ${selected?.name ?? "user"}.`,
      });
      setTitle("");
      setMessage("");
      setSelected(null);
      setSearch("");
      void qc.invalidateQueries({ queryKey: ["all-notifications"] });
    },
    onError: () => {
      toast.error("Failed to send notification");
    },
  });

  const canSend =
    selected?.userId &&
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    !mutation.isPending;

  function handleSend() {
    if (!canSend || !selected?.userId) return;
    mutation.mutate({ userId: selected.userId, title: title.trim(), message: message.trim(), type });
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#315eff]/10 flex items-center justify-center">
          <Bell size={18} className="text-[#315eff]" />
        </div>
        <div>
          <h1 className="text-[16px] font-[700] text-[#111827] leading-none">Notifications</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">Send targeted notifications to employees</p>
        </div>
      </div>

      <div className="grid grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── SEND FORM ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
          <h2 className="text-[13px] font-[600] text-[#111827]">Send notification</h2>

          {/* Employee picker */}
          <div className="relative">
            <label className="block text-[11px] font-[600] text-[#6B7280] mb-1.5 uppercase tracking-wide">
              Recipient
            </label>
            {selected ? (
              <div className="flex items-center justify-between px-3 py-2.5 border border-[#315eff] rounded-lg bg-[#EEF2FF]/40">
                <div>
                  <p className="text-[12px] font-[600] text-[#111827]">{selected.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{selected.email} · {selected.employeeCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setSearch(""); }}
                  className="text-[11px] text-[#9CA3AF] hover:text-red-500 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={search}
                  placeholder="Search employee name, email or code…"
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
                  className="w-full h-9 pl-8 pr-3 border border-[#E5E7EB] rounded-lg text-[12px] text-[#111827] placeholder-[#D1D5DB] focus:outline-none focus:border-[#315eff] focus:ring-1 focus:ring-[#315eff]/20"
                />
                {showDrop && filtered.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden">
                    {filtered.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onMouseDown={() => { setSelected(emp); setSearch(""); setShowDrop(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#F8F9FC] transition-colors"
                      >
                        <p className="text-[12px] font-[500] text-[#111827]">{emp.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{emp.email} · {emp.employeeCode}</p>
                        {!emp.userId && (
                          <p className="text-[10px] text-red-400 mt-0.5">No user account — cannot send</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-[600] text-[#6B7280] mb-1.5 uppercase tracking-wide">
              Type
            </label>
            <div className="flex gap-2">
              {(["SYSTEM", "EMAIL", "SMS"] as NotificationType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 h-8 rounded-lg border text-[11px] font-[600] transition-all ${
                    type === t
                      ? "border-[#315eff] bg-[#EEF2FF] text-[#2048EE]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#315eff]/40"
                  }`}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-[600] text-[#6B7280] mb-1.5 uppercase tracking-wide">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Your advance has been approved"
              maxLength={120}
              className="w-full h-9 px-3 border border-[#E5E7EB] rounded-lg text-[12px] text-[#111827] placeholder-[#D1D5DB] focus:outline-none focus:border-[#315eff] focus:ring-1 focus:ring-[#315eff]/20"
            />
            <p className="text-[10px] text-[#D1D5DB] mt-1 text-right">{title.length}/120</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-[600] text-[#6B7280] mb-1.5 uppercase tracking-wide">
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your notification message here…"
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[12px] text-[#111827] placeholder-[#D1D5DB] focus:outline-none focus:border-[#315eff] focus:ring-1 focus:ring-[#315eff]/20 resize-none"
            />
            <p className="text-[10px] text-[#D1D5DB] mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="w-full h-9 rounded-lg bg-[#315eff] hover:bg-[#2048EE] text-white text-[12px] font-[600] flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            {mutation.isPending ? "Sending…" : "Send notification"}
          </button>

          {selected && !selected.userId && (
            <p className="text-[11px] text-red-500 text-center -mt-2">
              This employee has no linked user account and cannot receive notifications.
            </p>
          )}
        </div>

        {/* ── NOTIFICATIONS LOG ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-[13px] font-[600] text-[#111827]">Notification log</h2>
            {notifData && (
              <span className="text-[11px] text-[#9CA3AF]">{notifData.total} total</span>
            )}
          </div>

          {notifLoading ? (
            <div className="flex items-center justify-center h-48 text-[#D1D5DB]">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#D1D5DB]">
              <BellOff size={22} />
              <p className="text-[12px]">No notifications sent yet</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#F3F4F6]">
                {notifications.map(n => (
                  <div key={n.id} className="px-5 py-3 hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {n.type && TYPE_CONFIG[n.type as NotificationType] && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-[600] uppercase tracking-wide ${TYPE_CONFIG[n.type as NotificationType].cls}`}>
                              {TYPE_CONFIG[n.type as NotificationType].label}
                            </span>
                          )}
                          <span className="text-[12px] font-[600] text-[#111827] truncate">{n.title}</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#D1D5DB] mt-1" title={fmtDate(n.createdAt)}>
                          {timeAgo(n.createdAt)} · {n.isRead ? "Read" : "Unread"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-[11px] text-[#9CA3AF]">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FC] disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FC] disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
