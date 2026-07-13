import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, ChevronLeft, ChevronRight, Monitor, Smartphone, Globe } from "lucide-react";
import { getAuditLogs } from "../services/auditService";
import type { AuditLog } from "../services/auditService";

// ── Action colour mapping ─────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  // Auth
  LOGIN_SUCCESS:             { label: "Login",              color: "#1D4ED8", bg: "var(--color-info-bg)" },
  LOGIN_FAILED:              { label: "Login failed",       color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  LOGOUT:                    { label: "Logout",             color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
  LOGOUT_SUCCESS:            { label: "Logout",             color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
  PASSWORD_CHANGED:          { label: "Password changed",   color: "var(--color-success)", bg: "var(--color-success-bg)" },
  PASSWORD_RESET_REQUESTED:  { label: "Reset requested",    color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  PASSWORD_RESET_SUCCESS:    { label: "Password reset",     color: "var(--color-success)", bg: "var(--color-success-bg)" },
  // Employer
  EMPLOYER_CREATED:          { label: "Employer created",   color: "#1D4ED8", bg: "var(--color-info-bg)" },
  EMPLOYER_STATUS_UPDATED:   { label: "Employer updated",   color: "#1D4ED8", bg: "var(--color-info-bg)" },
  EMPLOYER_APPROVED:         { label: "Employer approved",  color: "var(--color-success)", bg: "var(--color-success-bg)" },
  EMPLOYER_REJECTED:         { label: "Employer rejected",  color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  // Employee
  EMPLOYEE_CREATED:          { label: "Employee created",   color: "#1D4ED8", bg: "var(--color-info-bg)" },
  EMPLOYEE_UPDATED:          { label: "Employee updated",   color: "#1D4ED8", bg: "var(--color-info-bg)" },
  // KYC / Bank
  KYC_SUBMITTED:             { label: "KYC submitted",      color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  KYC_APPROVED:              { label: "KYC approved",       color: "var(--color-success)", bg: "var(--color-success-bg)" },
  KYC_REJECTED:              { label: "KYC rejected",       color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  BANK_VERIFIED:             { label: "Bank verified",      color: "var(--color-success)", bg: "var(--color-success-bg)" },
  // Salary
  SALARY_REQUEST_CREATED:    { label: "Request created",    color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  SALARY_REQUEST_APPROVED:   { label: "Request approved",   color: "#1D4ED8", bg: "var(--color-info-bg)" },
  SALARY_REQUEST_REJECTED:   { label: "Request rejected",   color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  SALARY_REQUEST_DISBURSED:  { label: "Disbursed",          color: "var(--color-success)", bg: "var(--color-success-bg)" },
  // Disbursal & Repayment
  DISBURSAL_CREATED:         { label: "Disbursal created",  color: "#1D4ED8", bg: "var(--color-info-bg)" },
  DISBURSAL_PROCESSED:       { label: "Disbursal processed",color: "var(--color-success)", bg: "var(--color-success-bg)" },
  REPAYMENT_CREATED:         { label: "Repayment created",  color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  // Membership
  MEMBERSHIP_ACTIVATED:      { label: "Membership activated",color: "var(--color-success)", bg: "var(--color-success-bg)" },
  MEMBERSHIP_EXPIRED:        { label: "Membership expired",  color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
};

const FALLBACK = { label: "", color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };

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
  const badgeStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4, height: 18, padding: "0 6px", borderRadius: 4, background: "var(--color-surface-muted)", color: "var(--color-ink-3)", fontSize: 11, fontWeight: 500 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
      <span style={badgeStyle}><Icon size={9} />{os}</span>
      <span style={badgeStyle}><Globe size={9} />{browser}</span>
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

  const selectStyle: React.CSSProperties = { height: 40, padding: "0 12px", fontSize: 13, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, outline: "none", color: "var(--color-ink-3)", fontFamily: "inherit", cursor: "pointer" };
  const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "12px 16px", verticalAlign: "top" };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Audit Logs</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Full audit trail — auth, employer, employee, salary, disbursal events</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 8, background: "var(--color-canvas)", border: "1px solid #E5E7EB" }}>
          <Shield size={12} color="var(--color-ink-3)" />
          <span style={{ fontSize: 12, color: "var(--color-ink-3)", fontWeight: 500 }}>{total.toLocaleString()} events</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 288 }}>
          <Search size={13} color="var(--color-ink-4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search action, email, entity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 40, paddingLeft: 36, paddingRight: 16, fontSize: 13, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, outline: "none", color: "var(--color-ink)", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
        <select value={actionFilter} onChange={handleFilterChange(setActionFilter)} style={selectStyle}>
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
        <select value={entityFilter} onChange={handleFilterChange(setEntityFilter)} style={selectStyle}>
          <option value="">All entity types</option>
          {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {(actionFilter || entityFilter || search) && (
          <button
            onClick={() => { setSearch(""); setActionFilter(""); setEntityFilter(""); setPage(1); }}
            style={{ height: 40, padding: "0 14px", fontSize: 13, color: "var(--color-ink-3)", border: "1px solid #E5E7EB", borderRadius: 10, background: "white", cursor: "pointer", fontFamily: "inherit" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* States */}
      {isLoading ? (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--color-ink-3)" }}>Loading audit logs…</p>
        </div>
      ) : isError ? (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>Could not load audit logs</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>Ensure the backend exposes <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, background: "var(--color-surface-muted)", padding: "2px 4px", borderRadius: 4 }}>GET /audit-logs</code> with admin auth.</p>
          <button type="button" onClick={() => void refetch()} style={{ marginTop: 12, height: 36, padding: "0 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, fontWeight: 600, color: "var(--color-ink-3)", background: "white", cursor: "pointer", fontFamily: "inherit" }}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>No audit events found</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>Events are recorded as admin and user actions occur.</p>
        </div>
      ) : (
        <>
          <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 13 }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6", background: "var(--color-surface-raised)" }}>
                  {["Action", "Performed by", "Entity type", "Entity ID", "Timestamp", "When"].map((h, i) => (
                    <th key={i} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(log => {
                  const cfg = actionCfg(log.action);
                  const deviceInfo = log.newValue?.deviceInfo as string | undefined;
                  const ipAddress  = log.newValue?.ipAddress as string | undefined;
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                      {/* Action */}
                      <td style={tdStyle}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                          {cfg.label}
                        </span>
                      </td>
                      {/* Performed by + device */}
                      <td style={tdStyle}>
                        {log.user ? (
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.user.email}</p>
                            <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2, fontFamily: "ui-monospace, monospace" }}>{log.user.role}</p>
                            {deviceInfo && <DeviceBadge ua={deviceInfo} />}
                            {ipAddress && !deviceInfo && (
                              <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 4, fontFamily: "ui-monospace, monospace" }}>{ipAddress}</p>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>System</span>
                        )}
                      </td>
                      {/* Entity type */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, color: "var(--color-ink-3)", fontFamily: "ui-monospace, monospace" }}>{log.entityType ?? "—"}</span>
                      </td>
                      {/* Entity ID */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, color: "var(--color-ink-3)", fontFamily: "ui-monospace, monospace", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default" }} title={log.entityId ?? ""}>
                          {log.entityId ? `${log.entityId.slice(0, 8)}…` : "—"}
                        </span>
                      </td>
                      {/* Timestamp */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>{formatDate(log.createdAt)}</span>
                      </td>
                      {/* Relative */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, color: "var(--color-ink-3)" }}>{timeAgo(log.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
              <p style={{ fontSize: 12, color: "var(--color-ink-3)", margin: 0 }}>
                Page {page} of {totalPages} · {total.toLocaleString()} total events
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "var(--color-ink-3)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  const active = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ width: 28, height: 28, fontSize: 12, borderRadius: 8, border: active ? "1px solid #315eff" : "1px solid #E5E7EB", background: active ? "var(--color-brand-soft)" : "white", color: active ? "var(--color-brand)" : "var(--color-ink-3)", fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "var(--color-ink-3)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.3 : 1 }}
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
