import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, ChevronLeft, ChevronRight, Monitor, Smartphone, Globe } from "lucide-react";
import { getAuditLogs } from "../services/auditService";
import type { AuditLog } from "../services/auditService";

// ── Action colour mapping ─────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  // Auth
  LOGIN_SUCCESS:             { label: "Login", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  LOGIN_FAILED:              { label: "Login failed", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  LOGOUT:                    { label: "Logout", dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" },
  LOGOUT_SUCCESS:            { label: "Logout", dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" },
  PASSWORD_CHANGED:          { label: "Password changed", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  PASSWORD_RESET_REQUESTED:  { label: "Reset requested", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  PASSWORD_RESET_SUCCESS:    { label: "Password reset", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  // Employer
  EMPLOYER_CREATED:          { label: "Employer created", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  EMPLOYER_STATUS_UPDATED:   { label: "Employer updated", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  EMPLOYER_APPROVED:         { label: "Employer approved", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  EMPLOYER_REJECTED:         { label: "Employer rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  // Employee
  EMPLOYEE_CREATED:          { label: "Employee created", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  EMPLOYEE_UPDATED:          { label: "Employee updated", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  // KYC / Bank
  KYC_SUBMITTED:             { label: "KYC submitted", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  KYC_APPROVED:              { label: "KYC approved", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  KYC_REJECTED:              { label: "KYC rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  BANK_VERIFIED:             { label: "Bank verified", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  // Salary
  SALARY_REQUEST_CREATED:    { label: "Request created", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  SALARY_REQUEST_APPROVED:   { label: "Request approved", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  SALARY_REQUEST_REJECTED:   { label: "Request rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  SALARY_REQUEST_DISBURSED:  { label: "Disbursed", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  // Disbursal & Repayment
  DISBURSAL_CREATED:         { label: "Disbursal created", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  DISBURSAL_PROCESSED:       { label: "Disbursal processed", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REPAYMENT_CREATED:         { label: "Repayment created", dot: "bg-[#D45F18]", text: "text-[#9A4910]", bg: "bg-[#FEF1E7]" },
  // Membership
  MEMBERSHIP_ACTIVATED:      { label: "Membership activated", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  MEMBERSHIP_EXPIRED:        { label: "Membership expired", dot: "bg-[#D45F18]", text: "text-[#9A4910]", bg: "bg-[#FEF1E7]" },
};

const FALLBACK = { label: "", dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" };

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
      <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded bg-[#F0F0F8] text-[#62657A] text-[11px] font-[500]">
        <Icon size={9} />
        {os}
      </span>
      <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded bg-[#F0F0F8] text-[#62657A] text-[11px] font-[500]">
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

  const { data, isLoading, isError, refetch } = useQuery({
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
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

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
          <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Audit Logs</h1>
          <p className="text-[13px] text-[#62657A] mt-0.5">Full audit trail — auth, employer, employee, salary, disbursal events</p>
        </div>
        <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#F7F7FB] border border-[#E4E4EF]">
          <Shield size={11} className="text-[#62657A]" />
          <span className="text-[11px] text-[#62657A] font-[500]">{total.toLocaleString()} events</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search action, email, entity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] w-full text-[#62657A] placeholder-[#B7B9C7]"
          />
        </div>
        <select
          value={actionFilter}
          onChange={handleFilterChange(setActionFilter)}
          className="h-8 px-2.5 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] text-[#62657A]"
        >
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
        <select
          value={entityFilter}
          onChange={handleFilterChange(setEntityFilter)}
          className="h-8 px-2.5 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] text-[#62657A]"
        >
          <option value="">All entity types</option>
          {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {(actionFilter || entityFilter || search) && (
          <button
            onClick={() => { setSearch(""); setActionFilter(""); setEntityFilter(""); setPage(1); }}
            className="h-8 px-3 text-[12px] text-[#62657A] hover:text-[#62657A] border border-[#E4E4EF] rounded-lg bg-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-[#62657A]">Loading audit logs…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-[#62657A] font-[500]">Could not load audit logs</p>
          <p className="text-[12px] text-[#62657A] mt-1">Ensure the backend exposes <code className="font-mono text-[11px] bg-[#F0F0F8] px-1 rounded">GET /audit-logs</code> with admin auth.</p>
          <button type="button" onClick={() => void refetch()} className="mt-3 h-8 px-3 rounded-lg border border-[#E4E4EF] text-[12px] font-[600] text-[#62657A] hover:bg-[#F7F7FB]">Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-[#62657A] font-[500]">No audit events found</p>
          <p className="text-[12px] text-[#62657A] mt-1">Events are recorded as admin and user actions occur.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
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
                <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]/60">
                  {["Action", "Performed by", "Entity type", "Entity ID", "Timestamp", "When"].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F8]">
                {rows.map(log => {
                  const cfg = actionCfg(log.action);
                  const deviceInfo = log.newValue?.deviceInfo as string | undefined;
                  const ipAddress  = log.newValue?.ipAddress as string | undefined;
                  return (
                    <tr key={log.id} className="hover:bg-[#F7F7FB]/50 transition-colors">
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
                            <p className="text-[12px] font-[500] text-[#191A2E] truncate leading-none">{log.user.email}</p>
                            <p className="text-[11px] text-[#62657A] mt-0.5 font-mono leading-none">{log.user.role}</p>
                            {deviceInfo && <DeviceBadge ua={deviceInfo} />}
                            {ipAddress && !deviceInfo && (
                              <p className="text-[11px] text-[#62657A] mt-1 font-mono">{ipAddress}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#62657A]">System</span>
                        )}
                      </td>
                      {/* Entity type */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-[#62657A] font-mono">{log.entityType ?? "—"}</span>
                      </td>
                      {/* Entity ID */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] text-[#62657A] font-mono truncate block cursor-default"
                          title={log.entityId ?? ""}
                        >
                          {log.entityId ? `${log.entityId.slice(0, 8)}…` : "—"}
                        </span>
                      </td>
                      {/* Timestamp */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-[#62657A]">{formatDate(log.createdAt)}</span>
                      </td>
                      {/* Relative */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-[#62657A]">{timeAgo(log.createdAt)}</span>
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
              <p className="text-[11px] text-[#62657A]">
                Page {page} of {totalPages} &middot; {total.toLocaleString()} total events
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E4E4EF] bg-white text-[#62657A] hover:bg-[#F7F7FB] disabled:opacity-30 disabled:cursor-not-allowed"
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
                          ? "border-[#7679FF] bg-[#ECEBFF] text-[#7679FF] font-[600]"
                          : "border-[#E4E4EF] bg-white text-[#62657A] hover:bg-[#F7F7FB]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E4E4EF] bg-white text-[#62657A] hover:bg-[#F7F7FB] disabled:opacity-30 disabled:cursor-not-allowed"
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
