import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, ChevronLeft, ChevronRight, Monitor, Smartphone, Globe } from "lucide-react";
import { getAuditLogs } from "../services/auditService";
import type { AuditLog } from "../services/auditService";

// ── Action colour mapping ─────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  // Auth
  LOGIN_SUCCESS:             { label: "Login",                dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  LOGIN_FAILED:              { label: "Login failed",         dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
  LOGOUT:                    { label: "Logout",               dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-100"  },
  LOGOUT_SUCCESS:            { label: "Logout",               dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-100"  },
  PASSWORD_CHANGED:          { label: "Password changed",     dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  PASSWORD_RESET_REQUESTED:  { label: "Reset requested",      dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  PASSWORD_RESET_SUCCESS:    { label: "Password reset",       dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  // Employer
  EMPLOYER_CREATED:          { label: "Employer created",     dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  EMPLOYER_STATUS_UPDATED:   { label: "Employer updated",     dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  EMPLOYER_APPROVED:         { label: "Employer approved",    dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  EMPLOYER_REJECTED:         { label: "Employer rejected",    dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
  // Employee
  EMPLOYEE_CREATED:          { label: "Employee created",     dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  EMPLOYEE_UPDATED:          { label: "Employee updated",     dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  // KYC / Bank
  KYC_SUBMITTED:             { label: "KYC submitted",        dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50"  },
  KYC_APPROVED:              { label: "KYC approved",         dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  KYC_REJECTED:              { label: "KYC rejected",         dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
  BANK_VERIFIED:             { label: "Bank verified",        dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  // Salary
  SALARY_REQUEST_CREATED:    { label: "Request created",      dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  SALARY_REQUEST_APPROVED:   { label: "Request approved",     dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  SALARY_REQUEST_REJECTED:   { label: "Request rejected",     dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
  SALARY_REQUEST_DISBURSED:  { label: "Disbursed",            dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  // Disbursal & Repayment
  DISBURSAL_CREATED:         { label: "Disbursal created",    dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  DISBURSAL_PROCESSED:       { label: "Disbursal processed",  dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  REPAYMENT_CREATED:         { label: "Repayment created",    dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  // Membership
  MEMBERSHIP_ACTIVATED:      { label: "Membership activated", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  MEMBERSHIP_EXPIRED:        { label: "Membership expired",   dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-100"  },
};

const FALLBACK = { label: "", dot: "bg-slate-300", text: "text-slate-500", bg: "bg-slate-50" };

function actionCfg(action: string) {
  return ACTION_CONFIG[action] ?? {
    ...FALLBACK,
    label: action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
  };
}

// ── Device info parser ────────────────────────────────────────────────────────

interface DeviceInfo { os: string; browser: string; isMobile: boolean }

function parseUA(ua: string): DeviceInfo {
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);

  let os = "Unknown OS";
  if (/Windows NT 10/i.test(ua))       os = "Windows 10";
  else if (/Windows NT 11/i.test(ua))  os = "Windows 11";
  else if (/Windows/i.test(ua))        os = "Windows";
  else if (/Mac OS X/i.test(ua))       os = "macOS";
  else if (/iPhone/i.test(ua))         os = "iOS";
  else if (/iPad/i.test(ua))           os = "iPadOS";
  else if (/Android/i.test(ua))        os = "Android";
  else if (/Linux/i.test(ua))          os = "Linux";

  let browser = "Unknown";
  if (/Edg\//i.test(ua))              browser = "Edge";
  else if (/OPR\//i.test(ua))         browser = "Opera";
  else if (/Firefox\//i.test(ua))     browser = "Firefox";
  else if (/Chrome\//i.test(ua))      browser = "Chrome";
  else if (/Safari\//i.test(ua))      browser = "Safari";

  return { os, browser, isMobile };
}

function DeviceBadge({ ua }: { ua: string }) {
  const { os, browser, isMobile } = parseUA(ua);
  const Icon = isMobile ? Smartphone : Monitor;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded bg-slate-100 text-slate-500 text-[10px] font-[500]">
        <Icon size={9} />
        {os}
      </span>
      <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded bg-slate-100 text-slate-500 text-[10px] font-[500]">
        <Globe size={9} />
        {browser}
      </span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const ENTITY_TYPES = ["AUTH", "EMPLOYER", "EMPLOYEE", "SALARY_REQUEST", "DISBURSAL", "REPAYMENT", "KYC", "BANK_ACCOUNT", "MEMBERSHIP", "USER"];
const ACTIONS = Object.keys(ACTION_CONFIG);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [search, setSearch]           = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage]               = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, entityFilter],
    queryFn: () => getAuditLogs({
      page,
      limit: PAGE_SIZE,
      ...(actionFilter ? { action: actionFilter }     : {}),
      ...(entityFilter ? { entityType: entityFilter } : {}),
    }),
    refetchInterval: 30_000,
  });

  const logs: AuditLog[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    const ua = (log.newValue?.deviceInfo as string | undefined) ?? "";
    return (
      log.action.toLowerCase().includes(q) ||
      (log.user?.email ?? "").toLowerCase().includes(q) ||
      (log.entityType ?? "").toLowerCase().includes(q) ||
      (log.entityId ?? "").toLowerCase().includes(q) ||
      ua.toLowerCase().includes(q)
    );
  });

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div className="px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Audit Logs</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Full audit trail — auth, employer, employee, salary, disbursal events</p>
        </div>
        <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-slate-50 border border-slate-200">
          <Shield size={11} className="text-slate-400" />
          <span className="text-[11px] text-slate-500 font-[500]">{total.toLocaleString()} events</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, email, entity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        <select
          value={actionFilter}
          onChange={handleFilterChange(setActionFilter)}
          className="h-8 px-2.5 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-600"
        >
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
        <select
          value={entityFilter}
          onChange={handleFilterChange(setEntityFilter)}
          className="h-8 px-2.5 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-600"
        >
          <option value="">All entity types</option>
          {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {(actionFilter || entityFilter || search) && (
          <button
            onClick={() => { setSearch(""); setActionFilter(""); setEntityFilter(""); setPage(1); }}
            className="h-8 px-3 text-[12px] text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg bg-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-400">Loading audit logs…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">Could not load audit logs</p>
          <p className="text-[12px] text-slate-400 mt-1">Ensure the backend exposes <code className="font-mono text-[11px] bg-slate-100 px-1 rounded">GET /audit-logs</code> with admin auth.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">No audit events found</p>
          <p className="text-[12px] text-slate-400 mt-1">Events are recorded as admin and user actions occur.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Action", "Performed by", "Entity type", "Entity ID", "Timestamp", "When"].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(log => {
                  const cfg = actionCfg(log.action);
                  const deviceInfo = log.newValue?.deviceInfo as string | undefined;
                  const ipAddress  = log.newValue?.ipAddress as string | undefined;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px] font-[500] ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      {/* Performed by + device */}
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <p className="text-[12px] font-[500] text-slate-800 truncate leading-none">{log.user.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono leading-none">{log.user.role}</p>
                            {deviceInfo && <DeviceBadge ua={deviceInfo} />}
                            {ipAddress && !deviceInfo && (
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">{ipAddress}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300">System</span>
                        )}
                      </td>
                      {/* Entity type */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-500 font-mono">{log.entityType ?? "—"}</span>
                      </td>
                      {/* Entity ID */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] text-slate-400 font-mono truncate block cursor-default"
                          title={log.entityId ?? ""}
                        >
                          {log.entityId ? `${log.entityId.slice(0, 8)}…` : "—"}
                        </span>
                      </td>
                      {/* Timestamp */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-500">{formatDate(log.createdAt)}</span>
                      </td>
                      {/* Relative */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-400">{timeAgo(log.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] text-slate-400">
                Page {page} of {totalPages} &middot; {total.toLocaleString()} total events
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-[11px] rounded-md border ${
                        p === page
                          ? "border-blue-400 bg-blue-50 text-blue-600 font-[600]"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
