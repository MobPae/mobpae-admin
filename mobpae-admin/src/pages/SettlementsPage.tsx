import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  Search,
  Send,
  X,
} from "lucide-react";
import {
  getSettlement,
  getSettlements,
  markSettlementPaid,
  sendSettlementReport,
} from "../services/settlementService";
import type { EmployerSettlement, EmployerSettlementStatus } from "../types/settlement";
import { getApiErrorMessage } from "../utils/api-errors";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: string | number) => fmt.format(typeof v === "string" ? parseFloat(v) || 0 : v);

const formatDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
};

const formatPayrollMonth = (raw: string) => {
  if (!raw) return "—";
  const m = raw.match(/^(\d{4})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return raw;
};

// ── status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  NO_DUES:        { label: "N/A",            color: "#6B7280", bg: "#F3F4F6" },
  PENDING:        { label: "Pending",        color: "#D97706", bg: "#FEF3C7" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#B45309", bg: "#FEF3C7" },
  PAID:           { label: "Paid",           color: "#16A34A", bg: "#DCFCE7" },
  OVERDUE:        { label: "Overdue",        color: "#DC2626", bg: "#FEE2E2" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── filter chips ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: "ALL" | EmployerSettlementStatus }[] = [
  { label: "All",            value: "ALL"           },
  { label: "Pending",        value: "PENDING"       },
  { label: "Overdue",        value: "OVERDUE"       },
  { label: "Partially Paid", value: "PARTIALLY_PAID"},
  { label: "Paid",           value: "PAID"          },
];

// ── toast ─────────────────────────────────────────────────────────────────────

type ToastKind = "success" | "error";
interface Toast { id: number; kind: ToastKind; message: string }

let _toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 13, fontWeight: 500, border: "1px solid", minWidth: 260, background: t.kind === "success" ? "#F3F0FF" : "#FEF2F2", borderColor: t.kind === "success" ? "#C8C9FF" : "#FECACA", color: t.kind === "success" ? "#111827" : "#991B1B" }}
        >
          {t.kind === "success"
            ? <CheckCircle2 size={15} color="#6C4CFF" style={{ flexShrink: 0 }} />
            : <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
          }
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.4, color: "inherit", padding: 0 }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, iconColor, highlight }: {
  label: string; value: React.ReactNode; icon: React.ReactNode;
  iconBg: string; iconColor: string; highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div style={{ background: "linear-gradient(135deg, #5B34FF 0%, #6C4CFF 100%)", borderRadius: 16, padding: "14px 16px", border: "1px solid #5B34FF", boxShadow: "0 4px 20px rgba(108,76,255,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "white" }}>{value}</div>
          <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{label}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: iconColor }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "#111827" }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "#6B7280" }}>{label}</div>
      </div>
    </div>
  );
}

// ── drawer ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
      <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: accent ? "#DC2626" : "#111827" }}>{value}</span>
    </div>
  );
}

function Timeline({ s }: { s: EmployerSettlement }) {
  const steps = [
    { label: "Created",           date: s.createdAt,       done: true },
    { label: "Payment due",       date: s.dueDate,         done: s.status !== "PENDING" },
    { label: "Grace period ends", date: s.gracePeriodEnd,  done: s.status === "OVERDUE" || s.status === "PAID" || s.status === "PARTIALLY_PAID", skip: !s.gracePeriodEnd },
    { label: "Settled",           date: s.paidDate,        done: s.status === "PAID" },
  ].filter(x => !x.skip);

  return (
    <div>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${step.done ? "#6C4CFF" : "#E5E7EB"}`, background: step.done ? "#F3F0FF" : "white" }}>
              {step.done
                ? <CheckCircle2 size={11} color="#6C4CFF" />
                : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D1D5DB" }} />}
            </div>
            {i < steps.length - 1 && <div style={{ width: 1, flex: 1, margin: "4px 0", background: step.done ? "#C8C9FF" : "#F3F4F6", minHeight: 18 }} />}
          </div>
          <div style={{ paddingBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: step.done ? "#111827" : "#6B7280", margin: 0, lineHeight: 1 }}>{step.label}</p>
            {step.date && <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{formatDate(step.date)}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function SettlementsPage() {
  const qc = useQueryClient();
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<"ALL" | EmployerSettlementStatus>("ALL");
  const [selected,  setSelected]  = useState<EmployerSettlement | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [marking,   setMarking]   = useState<string | null>(null);   // settlement id being marked
  const [sending,   setSending]   = useState<string | null>(null);   // settlement id being reported
  const [markError, setMarkError] = useState("");
  const [toasts,    setToasts]    = useState<Toast[]>([]);

  // ── toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((kind: ToastKind, message: string) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, kind, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── query ──────────────────────────────────────────────────────────────────
  const { data: settlements = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["settlements"],
    queryFn: getSettlements,
  });

  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: settlements.length };
    settlements.forEach(s => { m[s.status] = (m[s.status] ?? 0) + 1; });
    return m;
  }, [settlements]);

  const totalOutstanding = useMemo(() =>
    settlements.reduce((sum, s) => sum + (parseFloat(s.outstandingAmount) || 0), 0),
    [settlements]
  );

  const rows = useMemo(() =>
    settlements.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s.employer.companyName.toLowerCase().includes(q) ||
        s.employer.companyCode.toLowerCase().includes(q) ||
        s.payrollMonth.toLowerCase().includes(q) ||
        (s.referenceNumber ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "ALL" || s.status === filter;
      return matchSearch && matchFilter;
    }),
    [settlements, search, filter]
  );

  // ── actions ────────────────────────────────────────────────────────────────
  const handleMarkPaid = async (s: EmployerSettlement) => {
    setMarking(s.id);
    setMarkError("");
    try {
      await markSettlementPaid(s.id);
      qc.invalidateQueries({ queryKey: ["settlements"] });
      addToast("success", `${s.employer.companyName} settlement marked as paid`);
      setSelected(null);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to mark as paid");
      setMarkError(msg);
    } finally {
      setMarking(null);
    }
  };

  const openSettlement = async (s: EmployerSettlement) => {
    setSelected(s);
    setMarkError("");
    setLoadingDetailId(s.id);
    try {
      const detail = await getSettlement(s.id);
      setSelected(detail);
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to load settlement recovery details"));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleSendReport = async (s: EmployerSettlement, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSending(s.id);
    try {
      await sendSettlementReport(s.id);
      addToast("success", `Report sent to ${s.employer.companyName}`);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to send report");
      addToast("error", msg);
    } finally {
      setSending(null);
    }
  };

  const canPay = (s: EmployerSettlement) =>
    s.status === "PENDING" || s.status === "PARTIALLY_PAID" || s.status === "OVERDUE";

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Toast container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0, fontFamily: "Inter, ui-sans-serif, sans-serif" }}>Settlements</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Track employer settlement obligations to MobPae.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24, marginTop: 24 }}>
        <StatCard label="Outstanding"  value={formatCurrency(totalOutstanding)} icon={<CircleDollarSign size={18} strokeWidth={1.75} />} iconBg="rgba(255,255,255,0.15)" iconColor="white"     highlight />
        <StatCard label="Pending"      value={counts["PENDING"] ?? 0}           icon={<Clock3 size={18} strokeWidth={1.75} />}           iconBg="#FEF3C7"              iconColor="#D97706" />
        <StatCard label="Overdue"      value={counts["OVERDUE"] ?? 0}           icon={<AlertTriangle size={18} strokeWidth={1.75} />}    iconBg="#FEE2E2"              iconColor="#EF4444" />
        <StatCard label="Paid"         value={counts["PAID"] ?? 0}              icon={<CheckCircle2 size={18} strokeWidth={1.75} />}     iconBg="#F3F0FF"              iconColor="#6C4CFF" />
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by employer, month, ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "#111827", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{ height: 36, padding: "0 14px", background: active ? "#111827" : "white", color: active ? "white" : "#6B7280", border: `1px solid ${active ? "#111827" : "#E5E7EB"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
              >
                {f.label}
                {counts[f.value] !== undefined && (
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{counts[f.value]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {isError ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#DC2626", margin: 0 }}>Failed to load settlements</p>
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Check your connection and try again.</p>
            <button onClick={() => void refetch()} style={{ marginTop: 16, height: 34, padding: "0 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
          </div>
        ) : isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid #F9FAFB" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F3F4F6", flexShrink: 0 }} className="animate-pulse" />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: "#F3F4F6", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 100 }} className="animate-pulse" />
                </div>
                <div style={{ height: 12, background: "#F3F4F6", borderRadius: 4, width: 80 }} className="animate-pulse" />
                <div style={{ height: 22, background: "#F3F4F6", borderRadius: 999, width: 70 }} className="animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <CreditCard size={18} color="#6B7280" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0 }}>No settlements found</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Settlements appear once employer recoveries are due to MobPae</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                  {["Employer", "Salary Cycle", "Total", "Outstanding", "Late Fee", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid #F9FAFB", background: selected?.id === s.id ? "#F3F0FF" : "transparent" }}
                  >
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", margin: 0 }}>{s.employer.companyName}</p>
                        <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{s.employer.companyCode}</p>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, color: "#6B7280", whiteSpace: "nowrap" }}>{formatPayrollMonth(s.payrollMonth)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(s.totalAmount)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: parseFloat(s.outstandingAmount) > 0 ? "#DC2626" : "#6C4CFF" }}>
                      {parseFloat(s.outstandingAmount) > 0 ? formatCurrency(s.outstandingAmount) : "No dues"}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "#6B7280", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {parseFloat(s.lateFeeAmount) > 0 ? formatCurrency(s.lateFeeAmount) : "—"}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: s.status === "OVERDUE" ? "#DC2626" : "#9CA3AF" }}>
                      {formatDate(s.dueDate)}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}><StatusPill status={s.status} /></td>

                    {/* ── Row actions ── */}
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {/* View Details */}
                        <button
                          title="View Details"
                          onClick={() => void openSettlement(s)}
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer" }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Send Report */}
                        <button
                          title="Send Report"
                          disabled={sending === s.id}
                          onClick={e => handleSendReport(s, e)}
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer", opacity: sending === s.id ? 0.5 : 1 }}
                        >
                          {sending === s.id
                            ? <span style={{ width: 12, height: 12, border: "2px solid rgba(108,76,255,0.3)", borderTopColor: "#6C4CFF", borderRadius: "50%" }} className="animate-spin" />
                            : <Send size={13} />
                          }
                        </button>

                        {/* Mark Paid (inline, only when payable) */}
                        {canPay(s) && (
                          <button
                            title="Mark as Paid"
                            disabled={marking === s.id}
                            onClick={e => { e.stopPropagation(); void handleMarkPaid(s); }}
                            style={{ height: 28, padding: "0 10px", display: "flex", alignItems: "center", gap: 4, borderRadius: 8, border: "1px solid #C8C9FF", background: "#F3F0FF", color: "#5B34FF", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", opacity: marking === s.id ? 0.5 : 1 }}
                          >
                            {marking === s.id
                              ? <span style={{ width: 12, height: 12, border: "2px solid rgba(108,76,255,0.3)", borderTopColor: "#6C4CFF", borderRadius: "50%" }} className="animate-spin" />
                              : <CheckCircle2 size={11} />
                            }
                            {marking === s.id ? "" : "Mark Paid"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer — settlement detail */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(1px)" }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 40, width: 460, background: "white", borderLeft: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <StatusPill status={selected.status} />
                    {selected.referenceNumber && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 6 }}>
                        Ref: {selected.referenceNumber}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>{selected.employer.companyName}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{formatPayrollMonth(selected.payrollMonth)} · {selected.employer.companyCode}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Overdue warning */}
              {selected.status === "OVERDUE" && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#B91C1C", margin: 0 }}>Payment overdue</p>
                    <p style={{ fontSize: 11, color: "#EF4444", marginTop: 3, lineHeight: 1.5 }}>
                      This settlement is past its due date. Employer has not remitted payment. Late fees may apply.
                    </p>
                  </div>
                </div>
              )}

              {/* Risk badge */}
              {selected.employer.riskStatus && selected.employer.riskStatus !== "LOW" && (
                <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={13} color="#F97316" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "#C2410C", fontWeight: 500, margin: 0 }}>Employer risk: <span style={{ fontWeight: 600 }}>{selected.employer.riskStatus}</span></p>
                </div>
              )}

              {/* Amount breakdown */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Amount Breakdown</p>
                <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Principal" value={formatCurrency(selected.principalAmount)} />
                  <InfoRow label="Interest"  value={formatCurrency(selected.interestAmount)} />
                  {parseFloat(selected.lateFeeAmount) > 0 && (
                    <InfoRow label="Late fee" value={formatCurrency(selected.lateFeeAmount)} accent />
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #E5E7EB", marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(selected.totalAmount)}</span>
                  </div>
                  {parseFloat(selected.outstandingAmount) > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #FEE2E2" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}>Outstanding</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(selected.outstandingAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key dates */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Key Dates</p>
                <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Due date"          value={formatDate(selected.dueDate)} accent={selected.status === "OVERDUE"} />
                  {selected.gracePeriodEnd && <InfoRow label="Grace period ends" value={formatDate(selected.gracePeriodEnd)} />}
                  {selected.paidDate && <InfoRow label="Paid on" value={formatDate(selected.paidDate)} />}
                  <InfoRow label="Created" value={formatDate(selected.createdAt)} />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Status Timeline</p>
                <Timeline s={selected} />
              </div>

              {/* Linked recoveries */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Linked Recoveries</p>
                {loadingDetailId === selected.id ? (
                  <div style={{ background: "#F8F9FC", border: "1px solid #E5E7EB", borderRadius: 16, padding: 16 }}>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Loading recovery rows...</p>
                  </div>
                ) : selected.repayments?.length ? (
                  <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", background: "white" }}>
                    {selected.repayments.map((repayment) => {
                      const employee = repayment.salaryRequest?.employee;
                      const requestLabel = repayment.salaryRequest?.requestId ?? repayment.salaryRequestId.slice(0, 8);
                      return (
                        <div key={repayment.id} style={{ padding: "12px 14px", borderBottom: "1px solid #F3F4F6" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", margin: 0 }}>{employee?.name ?? "Employee"}</p>
                              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                                {employee?.employeeCode ?? "Code unavailable"} · Req {requestLabel}
                              </p>
                            </div>
                            <StatusPill status={repayment.status} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
                            <div>
                              <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: 0 }}>Principal</p>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{formatCurrency(repayment.principalAmount)}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: 0 }}>Interest</p>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 2 }}>{formatCurrency(repayment.interestAmount)}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 10.5, color: "#9CA3AF", margin: 0 }}>Total</p>
                              <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginTop: 2 }}>{formatCurrency(repayment.totalAmount)}</p>
                            </div>
                          </div>
                          <p style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>Due {formatDate(repayment.dueDate)}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: "#F8F9FC", border: "1px solid #E5E7EB", borderRadius: 16, padding: "12px 14px" }}>
                    <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                      No linked recovery rows were returned for this settlement. This can happen for older records or no-dues cycles.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Notes</p>
                  <div style={{ background: "#F8F9FC", border: "1px solid #E5E7EB", borderRadius: 16, padding: "12px 16px" }}>
                    <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 8 }}>
              {markError && <p style={{ fontSize: 11, color: "#DC2626", textAlign: "center", margin: 0 }}>{markError}</p>}

              {/* Send Report */}
              <button
                onClick={() => handleSendReport(selected)}
                disabled={sending === selected.id}
                style={{ width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, border: "1px solid #6C4CFF", color: "#6C4CFF", fontSize: 13, fontWeight: 600, background: "white", cursor: sending === selected.id ? "not-allowed" : "pointer", opacity: sending === selected.id ? 0.5 : 1, fontFamily: "inherit" }}
              >
                {sending === selected.id
                  ? <span style={{ width: 16, height: 16, border: "2px solid rgba(108,76,255,0.3)", borderTopColor: "#6C4CFF", borderRadius: "50%" }} className="animate-spin" />
                  : <Send size={15} />
                }
                {sending === selected.id ? "Sending…" : "Send Report"}
              </button>

              {/* Mark Paid */}
              {canPay(selected) && (
                <>
                  <button
                    onClick={() => handleMarkPaid(selected)}
                    disabled={marking === selected.id}
                    style={{ width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, background: "#6C4CFF", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: marking === selected.id ? "not-allowed" : "pointer", opacity: marking === selected.id ? 0.5 : 1, fontFamily: "inherit" }}
                  >
                    <CheckCircle2 size={15} />
                    {marking === selected.id ? "Processing…" : "Mark as Paid"}
                  </button>
                  <p style={{ fontSize: 11, color: "#6B7280", textAlign: "center", margin: 0 }}>
                    Confirm receipt of {formatCurrency(selected.outstandingAmount || selected.totalAmount)} from {selected.employer.companyName}. Linked recoveries will move to recovered.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
