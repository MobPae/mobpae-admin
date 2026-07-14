import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
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
import { exportToCsv } from "../utils/exportCsv";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: string | number) => fmt.format(typeof v === "string" ? parseFloat(v) || 0 : v);

const formatDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
};

/** Format cycleDate (ISO DateTime, first of month) as "July 2026" */
const formatCycleDate = (raw: string | null | undefined): string => {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return raw;
  }
};

// ── status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
  GENERATED:      { label: "Generated",      color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "var(--color-warning-dark)", bg: "var(--color-warning-bg)" },
  PAID:           { label: "Paid",           color: "var(--color-success)", bg: "var(--color-success-bg)" },
  OVERDUE:        { label: "Overdue",        color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  CANCELLED:      { label: "Cancelled",      color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
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
  { label: "Generated",      value: "GENERATED"     },
  { label: "Overdue",        value: "OVERDUE"       },
  { label: "Partially Paid", value: "PARTIALLY_PAID"},
  { label: "Paid",           value: "PAID"          },
];

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, iconColor, highlight }: {
  label: string; value: React.ReactNode; icon: React.ReactNode;
  iconBg: string; iconColor: string; highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div style={{ background: "linear-gradient(135deg, var(--color-info) 0%, #315eff 100%)", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-info)", boxShadow: "0 4px 20px rgba(49,94,255,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "white" }}>{value}</div>
          <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{label}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-edge)", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: iconColor }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--color-ink)" }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "var(--color-ink-3)" }}>{label}</div>
      </div>
    </div>
  );
}

// ── drawer ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-edge-2)" }}>
      <span style={{ fontSize: 12, color: "var(--color-ink-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: accent ? "var(--color-danger)" : "var(--color-ink)" }}>{value}</span>
    </div>
  );
}

function Timeline({ s }: { s: EmployerSettlement }) {
  const steps = [
    { label: "Created",           date: s.createdAt,       done: true },
    { label: "Payment due",       date: s.dueDate,         done: s.status !== "GENERATED" && s.status !== "DRAFT" },
    { label: "Grace period ends", date: s.gracePeriodEnd,  done: s.status === "OVERDUE" || s.status === "PAID" || s.status === "PARTIALLY_PAID", skip: !s.gracePeriodEnd },
    { label: "Settled",           date: s.paidDate,        done: s.status === "PAID" },
  ].filter(x => !x.skip);

  return (
    <div>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${step.done ? "var(--color-brand)" : "var(--color-edge)"}`, background: step.done ? "var(--color-brand-soft)" : "white" }}>
              {step.done
                ? <CheckCircle2 size={11} color="var(--color-brand)" />
                : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-ink-disabled)" }} />}
            </div>
            {i < steps.length - 1 && <div style={{ width: 1, flex: 1, margin: "4px 0", background: step.done ? "var(--color-brand-muted)" : "var(--color-surface-muted)", minHeight: 18 }} />}
          </div>
          <div style={{ paddingBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: step.done ? "var(--color-ink)" : "var(--color-ink-3)", margin: 0, lineHeight: 1 }}>{step.label}</p>
            {step.date && <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>{formatDate(step.date)}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 15;

// ── page ──────────────────────────────────────────────────────────────────────

export default function SettlementsPage() {
  const qc = useQueryClient();
  const [search,    setSearch]    = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter,    setFilter]    = useState<"ALL" | EmployerSettlementStatus>("ALL");
  const [selected,  setSelected]  = useState<EmployerSettlement | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [marking,   setMarking]   = useState<string | null>(null);
  const [sending,   setSending]   = useState<string | null>(null);
  const [markError, setMarkError] = useState("");
  const [confirmPay, setConfirmPay] = useState<EmployerSettlement | null>(null);
  const [page,      setPage]      = useState(1);

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
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q ||
        s.employer.companyName.toLowerCase().includes(q) ||
        s.employer.companyCode.toLowerCase().includes(q) ||
        (s.settlementNumber ?? "").toLowerCase().includes(q) ||
        formatCycleDate(s.cycleDate).toLowerCase().includes(q);
      const matchFilter = filter === "ALL" || s.status === filter;
      return matchSearch && matchFilter;
    }),
    [settlements, debouncedSearch, filter]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleMarkPaid = async (s: EmployerSettlement) => {
    setMarking(s.id);
    setMarkError("");
    try {
      await markSettlementPaid(s.id);
      qc.invalidateQueries({ queryKey: ["settlements"] });
      toast.success("Settlement marked as paid", { description: `${s.employer.companyName} — payment recorded.` });
      setSelected(null);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to mark as paid");
      setMarkError(msg);
      toast.error("Failed to mark as paid", { description: msg });
    } finally {
      setMarking(null);
      setConfirmPay(null);
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
      toast.error("Failed to load settlement details", { description: getApiErrorMessage(err) });
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleSendReport = async (s: EmployerSettlement, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSending(s.id);
    try {
      await sendSettlementReport(s.id);
      toast.success("Report sent", { description: `Settlement report sent to ${s.employer.companyName}.` });
    } catch (err) {
      toast.error("Failed to send report", { description: getApiErrorMessage(err) });
    } finally {
      setSending(null);
    }
  };

  const canPay = (s: EmployerSettlement) =>
    s.status === "GENERATED" || s.status === "PARTIALLY_PAID" || s.status === "OVERDUE";

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0, fontFamily: "Inter, ui-sans-serif, sans-serif" }}>Settlements</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Track employer settlement obligations to MobPae.</p>
        </div>
        <button
          onClick={() => exportToCsv(rows.map(s => ({
            Employer: s.employer.companyName,
            "Settlement No.": s.settlementNumber ?? "",
            "Salary Cycle": formatCycleDate(s.cycleDate),
            Total: s.totalAmount,
            Outstanding: s.outstandingAmount,
            "Late Fee": s.lateFeeAmount,
            "Due Date": s.dueDate ?? "",
            Status: s.status,
          })), "settlements")}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24, marginTop: 24 }}>
        <StatCard label="Outstanding"  value={formatCurrency(totalOutstanding)} icon={<CircleDollarSign size={18} strokeWidth={1.75} />} iconBg="rgba(255,255,255,0.15)" iconColor="white"     highlight />
        <StatCard label="Generated"    value={counts["GENERATED"] ?? 0}          icon={<Clock3 size={18} strokeWidth={1.75} />}           iconBg="var(--color-warning-bg)"              iconColor="var(--color-warning)" />
        <StatCard label="Overdue"      value={counts["OVERDUE"] ?? 0}            icon={<AlertTriangle size={18} strokeWidth={1.75} />}    iconBg="var(--color-danger-bg)"              iconColor="#EF4444" />
        <StatCard label="Paid"         value={counts["PAID"] ?? 0}               icon={<CheckCircle2 size={18} strokeWidth={1.75} />}     iconBg="var(--color-brand-soft)"              iconColor="var(--color-brand)" />
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by employer, cycle, settlement no…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                style={{ height: 36, padding: "0 14px", background: active ? "var(--color-ink)" : "white", color: active ? "white" : "var(--color-ink-3)", border: `1px solid ${active ? "var(--color-ink)" : "var(--color-edge)"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
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
      <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
        {isError ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-danger)", margin: 0 }}>Failed to load settlements</p>
            <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>Check your connection and try again.</p>
            <button onClick={() => void refetch()} style={{ marginTop: 16, height: 34, padding: "0 16px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
          </div>
        ) : isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--color-canvas)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
                </div>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 80 }} className="animate-pulse" />
                <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 70 }} className="animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <CreditCard size={18} color="var(--color-ink-3)" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-3)", margin: 0 }}>No settlements found</p>
            <p style={{ fontSize: 12, color: "var(--color-ink-4)", marginTop: 4 }}>Settlements appear once employer recoveries are due to MobPae</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
                  {["Employer", "Settlement No.", "Salary Cycle", "Total", "Outstanding", "Late Fee", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(s => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid var(--color-canvas)", background: selected?.id === s.id ? "var(--color-brand-soft)" : "transparent" }}
                  >
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{s.employer.companyName}</p>
                        <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{s.employer.companyCode}</p>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--color-ink-2)" }}>{s.settlementNumber}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, color: "var(--color-ink-3)", whiteSpace: "nowrap" }}>{formatCycleDate(s.cycleDate)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, color: "var(--color-ink)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(s.totalAmount)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: parseFloat(s.outstandingAmount) > 0 ? "var(--color-danger)" : "var(--color-brand)" }}>
                      {parseFloat(s.outstandingAmount) > 0 ? formatCurrency(s.outstandingAmount) : "No dues"}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--color-ink-3)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {parseFloat(s.lateFeeAmount) > 0 ? formatCurrency(s.lateFeeAmount) : "—"}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: s.status === "OVERDUE" ? "var(--color-danger)" : "var(--color-ink-4)" }}>
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
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--color-edge)", background: "white", color: "var(--color-ink-3)", cursor: "pointer" }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Send Report */}
                        <button
                          title="Send Report"
                          disabled={sending === s.id}
                          onClick={e => handleSendReport(s, e)}
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--color-edge)", background: "white", color: "var(--color-ink-3)", cursor: "pointer", opacity: sending === s.id ? 0.5 : 1 }}
                        >
                          {sending === s.id
                            ? <span style={{ width: 12, height: 12, border: "2px solid rgba(49,94,255,0.3)", borderTopColor: "var(--color-brand)", borderRadius: "50%" }} className="animate-spin" />
                            : <Send size={13} />
                          }
                        </button>

                        {/* Mark Paid (inline, only when payable) */}
                        {canPay(s) && (
                          <button
                            title="Mark as Paid"
                            disabled={marking === s.id}
                            onClick={e => { e.stopPropagation(); setConfirmPay(s); }}
                            style={{ height: 28, padding: "0 10px", display: "flex", alignItems: "center", gap: 4, borderRadius: 8, border: "1px solid #C8C9FF", background: "var(--color-brand-soft)", color: "var(--color-info)", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", opacity: marking === s.id ? 0.5 : 1 }}
                          >
                            {marking === s.id
                              ? <span style={{ width: 12, height: 12, border: "2px solid rgba(49,94,255,0.3)", borderTopColor: "var(--color-brand)", borderRadius: "50%" }} className="animate-spin" />
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

      {!isError && !isLoading && rows.length > 0 && (
        <Pagination page={safePage} totalPages={totalPages} total={rows.length} limit={PAGE_SIZE} onPage={setPage} />
      )}

      {/* Drawer — settlement detail */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(1px)" }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 40, width: 460, background: "white", borderLeft: "1px solid var(--color-edge)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--color-edge)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <StatusPill status={selected.status} />
                    {selected.settlementNumber && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-ink-3)", background: "var(--color-surface-muted)", padding: "2px 8px", borderRadius: 6, fontFamily: "ui-monospace, monospace" }}>
                        {selected.settlementNumber}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-ink)", margin: 0, lineHeight: 1.2 }}>{selected.employer.companyName}</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 2 }}>{formatCycleDate(selected.cycleDate)} · {selected.employer.companyCode}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--color-edge)", background: "white", color: "var(--color-ink-3)", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Overdue warning */}
              {selected.status === "OVERDUE" && (
                <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-danger-dark)", margin: 0 }}>Payment overdue</p>
                    <p style={{ fontSize: 11, color: "#EF4444", marginTop: 3, lineHeight: 1.5 }}>
                      This settlement is past its due date. Employer has not remitted payment. Late fees may apply.
                    </p>
                  </div>
                </div>
              )}

              {/* Risk badge */}
              {selected.employer.riskStatus && selected.employer.riskStatus !== "LOW" && (
                <div style={{ background: "var(--color-warning-soft)", border: "1px solid var(--color-warning-bg)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={13} color="#F97316" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--color-warning-dark)", fontWeight: 500, margin: 0 }}>Employer risk: <span style={{ fontWeight: 600 }}>{selected.employer.riskStatus}</span></p>
                </div>
              )}

              {/* Amount breakdown */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Amount Breakdown</p>
                <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Principal" value={formatCurrency(selected.principalAmount)} />
                  <InfoRow label="Interest"  value={formatCurrency(selected.interestAmount)} />
                  {parseFloat(selected.processingFeeAmount ?? "0") > 0 && (
                    <InfoRow label="Processing fee" value={formatCurrency(selected.processingFeeAmount)} />
                  )}
                  {parseFloat(selected.gstAmount ?? "0") > 0 && (
                    <InfoRow label="GST" value={formatCurrency(selected.gstAmount)} />
                  )}
                  {parseFloat(selected.lateFeeAmount) > 0 && (
                    <InfoRow label="Late fee" value={formatCurrency(selected.lateFeeAmount)} accent />
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--color-edge)", marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(selected.totalAmount)}</span>
                  </div>
                  {parseFloat(selected.outstandingAmount) > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--color-danger-bg)" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-danger)" }}>Outstanding</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-danger)", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(selected.outstandingAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key dates */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Key Dates</p>
                <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Due date"          value={formatDate(selected.dueDate)} accent={selected.status === "OVERDUE"} />
                  {selected.gracePeriodEnd && <InfoRow label="Grace period ends" value={formatDate(selected.gracePeriodEnd)} />}
                  {selected.paidDate && <InfoRow label="Paid on" value={formatDate(selected.paidDate)} />}
                  {selected.generatedAt && <InfoRow label="Generated" value={formatDate(selected.generatedAt)} />}
                  <InfoRow label="Created" value={formatDate(selected.createdAt)} />
                  {selected.employeeCount > 0 && <InfoRow label="Employees" value={`${selected.employeeCount}`} />}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Status Timeline</p>
                <Timeline s={selected} />
              </div>

              {/* Linked salary deductions */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Salary Deductions</p>
                {loadingDetailId === selected.id ? (
                  <div style={{ background: "var(--color-canvas)", border: "1px solid var(--color-edge)", borderRadius: 16, padding: 16 }}>
                    <p style={{ fontSize: 12, color: "var(--color-ink-3)", margin: 0 }}>Loading salary deduction rows…</p>
                  </div>
                ) : selected.lineItems?.length ? (
                  <div style={{ border: "1px solid var(--color-edge)", borderRadius: 16, overflow: "hidden", background: "white" }}>
                    {selected.lineItems.map((item) => (
                      <div key={item.id} style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-edge-2)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{item.employeeName}</p>
                            <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>
                              {item.employeeCode} · {item.loanApplicationNumber}
                            </p>
                          </div>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--color-surface-muted)", color: "var(--color-ink-3)", flexShrink: 0 }}>{item.status}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
                          <div>
                            <p style={{ fontSize: 10.5, color: "var(--color-ink-4)", margin: 0 }}>Principal</p>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)", marginTop: 2 }}>{formatCurrency(item.principalAmount)}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10.5, color: "var(--color-ink-4)", margin: 0 }}>Interest</p>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)", marginTop: 2 }}>{formatCurrency(item.interestAmount)}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10.5, color: "var(--color-ink-4)", margin: 0 }}>Total deduction</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)", marginTop: 2 }}>{formatCurrency(item.totalDeductionAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "var(--color-canvas)", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "12px 14px" }}>
                    <p style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.5, margin: 0 }}>
                      No salary deduction rows linked to this settlement yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Notes</p>
                  <div style={{ background: "var(--color-canvas)", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "12px 16px" }}>
                    <p style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-edge)", display: "flex", flexDirection: "column", gap: 8 }}>
              {markError && <p style={{ fontSize: 11, color: "var(--color-danger)", textAlign: "center", margin: 0 }}>{markError}</p>}

              {/* Send Report */}
              <button
                onClick={() => handleSendReport(selected)}
                disabled={sending === selected.id}
                style={{ width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, border: "1px solid var(--color-brand)", color: "var(--color-brand)", fontSize: 13, fontWeight: 600, background: "white", cursor: sending === selected.id ? "not-allowed" : "pointer", opacity: sending === selected.id ? 0.5 : 1, fontFamily: "inherit" }}
              >
                {sending === selected.id
                  ? <span style={{ width: 16, height: 16, border: "2px solid rgba(49,94,255,0.3)", borderTopColor: "var(--color-brand)", borderRadius: "50%" }} className="animate-spin" />
                  : <Send size={15} />
                }
                {sending === selected.id ? "Sending…" : "Send Report"}
              </button>

              {/* Mark Paid */}
              {canPay(selected) && (
                <>
                  <button
                    onClick={() => setConfirmPay(selected)}
                    disabled={marking === selected.id}
                    style={{ width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, background: "var(--color-brand)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: marking === selected.id ? "not-allowed" : "pointer", opacity: marking === selected.id ? 0.5 : 1, fontFamily: "inherit" }}
                  >
                    <CheckCircle2 size={15} />
                    {marking === selected.id ? "Processing…" : "Mark as Paid"}
                  </button>
                  <p style={{ fontSize: 11, color: "var(--color-ink-3)", textAlign: "center", margin: 0 }}>
                    Confirm receipt of {formatCurrency(selected.outstandingAmount || selected.totalAmount)} from {selected.employer.companyName}. Linked salary deductions will move to recovered.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmPay !== null}
        title="Mark settlement as paid?"
        description={confirmPay ? `Confirm receipt of ${formatCurrency(confirmPay.outstandingAmount || confirmPay.totalAmount)} from ${confirmPay.employer.companyName}. Linked salary deductions will move to recovered.` : ""}
        confirmLabel="Mark as Paid"
        confirmVariant="primary"
        loading={confirmPay !== null && marking === confirmPay.id}
        onConfirm={() => confirmPay && void handleMarkPaid(confirmPay)}
        onCancel={() => setConfirmPay(null)}
      />
    </div>
  );
}
