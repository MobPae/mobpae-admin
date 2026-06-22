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

const STATUS_CFG: Record<EmployerSettlementStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:        { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  PARTIALLY_PAID: { label: "Partially Paid", dot: "bg-[#D45F18]", text: "text-[#9A4910]", bg: "bg-[#FEF1E7]" },
  PAID:           { label: "Paid", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  OVERDUE:        { label: "Overdue", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
};

function StatusPill({ status }: { status: EmployerSettlementStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-[500] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-[13px] font-[500] border min-w-[260px] ${
            t.kind === "success"
              ? "bg-[#ECEBFF] border-[#C8C9FF] text-[#191A2E]"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {t.kind === "success"
            ? <CheckCircle2 size={15} className="text-[#7679FF] flex-shrink-0" />
            : <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
          }
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="text-inherit opacity-40 hover:opacity-70">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, iconColor, highlight, sub }: {
  label: string; value: React.ReactNode; icon: React.ReactNode;
  iconBg: string; iconColor: string; highlight?: boolean; sub?: string;
}) {
  return (
    <div className={`rounded-xl px-4 py-3.5 flex items-center gap-3 border ${highlight ? "bg-[#7679FF] border-[#5659D9]" : "bg-white border-[#E4E4EF]"}`}>
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}>{icon}</div>
      <div>
        <p className={`text-[20px] font-[600] leading-none tabular-nums ${highlight ? "text-white" : "text-[#191A2E]"}`}>{value}</p>
        <p className={`text-[11px] mt-0.5 ${highlight ? "text-white/40" : "text-[#62657A]"}`}>{label}{sub ? ` · ${sub}` : ""}</p>
      </div>
    </div>
  );
}

// ── drawer ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F0F8] last:border-0">
      <span className="text-[12px] text-[#62657A]">{label}</span>
      <span className={`text-[12px] font-[500] ${accent ? "text-red-600" : "text-[#191A2E]"}`}>{value}</span>
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
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${step.done ? "border-[#7679FF] bg-[#ECEBFF]" : "border-[#E4E4EF] bg-white"}`}>
              {step.done
                ? <CheckCircle2 size={11} className="text-[#7679FF]" />
                : <span className="w-1.5 h-1.5 rounded-full bg-[#D4D5E0]" />}
            </div>
            {i < steps.length - 1 && <div className={`w-px flex-1 my-1 ${step.done ? "bg-[#C8C9FF]" : "bg-[#F0F0F8]"}`} style={{ minHeight: 18 }} />}
          </div>
          <div className="pb-4">
            <p className={`text-[12px] font-[500] leading-none ${step.done ? "text-[#191A2E]" : "text-[#62657A]"}`}>{step.label}</p>
            {step.date && <p className="text-[11px] text-[#62657A] mt-0.5">{formatDate(step.date)}</p>}
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
      addToast("success", `${s.employer.companyName} marked as paid`);
      setSelected(null);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to mark as paid");
      setMarkError(msg);
    } finally {
      setMarking(null);
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
    <div className="px-8 py-6 space-y-5">
      {/* Toast container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Settlements</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Track employer settlement obligations to MobPae</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={<CircleDollarSign size={15} />}
          iconBg="bg-white/10" iconColor="text-white/80"
          highlight
          sub="owed to MobPae"
        />
        <StatCard
          label="Pending"
          value={counts["PENDING"] ?? 0}
          icon={<Clock3 size={15} />}
          iconBg="bg-amber-50" iconColor="text-amber-600"
        />
        <StatCard
          label="Overdue"
          value={counts["OVERDUE"] ?? 0}
          icon={<AlertTriangle size={15} />}
          iconBg="bg-red-50" iconColor="text-red-600"
        />
        <StatCard
          label="Paid"
          value={counts["PAID"] ?? 0}
          icon={<CheckCircle2 size={15} />}
          iconBg="bg-[#ECEBFF]" iconColor="text-[#7679FF]"
        />
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search by employer, month, ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] w-64 text-[#62657A] placeholder-[#B7B9C7]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 rounded-full text-[12px] font-[500] transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-[#191A2E] text-white"
                  : "bg-white border border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF]"
              }`}
            >
              {f.label}
              {counts[f.value] !== undefined && (
                <span className={`text-[11px] font-[700] ${filter === f.value ? "text-white/60" : "text-[#62657A]"}`}>
                  {counts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
        {isError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[13px] font-[500] text-red-600">Failed to load settlements</p>
            <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
            <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F0F0F8] last:border-0">
                <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-28 bg-[#F0F0F8] rounded animate-pulse" />
                  <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-20 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
              <CreditCard size={18} className="text-[#62657A]" />
            </div>
            <p className="text-[13px] font-[500] text-[#62657A]">No settlements found</p>
            <p className="text-[12px] text-[#62657A] mt-1">Settlements appear once employer payroll recoveries are due</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E4E4EF]">
                  {["Employer", "Payroll Month", "Total", "Outstanding", "Late Fee", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-[#62657A] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F8]">
                {rows.map(s => (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#F7F7FB]/60 transition-colors ${selected?.id === s.id ? "bg-[#ECEBFF]/30" : ""} ${s.status === "OVERDUE" ? "bg-red-50/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-[500] text-[#191A2E]">{s.employer.companyName}</p>
                        <p className="text-[#62657A] text-[11px]">{s.employer.companyCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-[500] text-[#62657A] whitespace-nowrap">{formatPayrollMonth(s.payrollMonth)}</td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-[#191A2E] whitespace-nowrap">{formatCurrency(s.totalAmount)}</td>
                    <td className={`px-4 py-3 tabular-nums font-[600] whitespace-nowrap ${parseFloat(s.outstandingAmount) > 0 ? "text-red-600" : "text-[#7679FF]"}`}>
                      {parseFloat(s.outstandingAmount) > 0 ? formatCurrency(s.outstandingAmount) : "No dues"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#62657A] whitespace-nowrap">
                      {parseFloat(s.lateFeeAmount) > 0 ? formatCurrency(s.lateFeeAmount) : <span className="text-[#62657A]">—</span>}
                    </td>
                    <td className={`px-4 py-3 tabular-nums font-[500] whitespace-nowrap ${s.status === "OVERDUE" ? "text-red-600" : "text-[#62657A]"}`}>
                      {formatDate(s.dueDate)}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={s.status} /></td>

                    {/* ── Row actions ── */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* View Report */}
                        <button
                          title="View Report"
                          onClick={() => { setSelected(s); setMarkError(""); }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E4E4EF] text-[#62657A] hover:border-[#7679FF] hover:text-[#7679FF] hover:bg-[#ECEBFF] transition-colors"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Send Report */}
                        <button
                          title="Send Report"
                          disabled={sending === s.id}
                          onClick={e => handleSendReport(s, e)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E4E4EF] text-[#62657A] hover:border-[#7679FF] hover:text-[#7679FF] hover:bg-[#ECEBFF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {sending === s.id
                            ? <span className="w-3 h-3 border-2 border-[#7679FF]/30 border-t-[#7679FF] rounded-full animate-spin" />
                            : <Send size={13} />
                          }
                        </button>

                        {/* Mark Paid (inline, only when payable) */}
                        {canPay(s) && (
                          <button
                            title="Mark as Paid"
                            disabled={marking === s.id}
                            onClick={e => { e.stopPropagation(); void handleMarkPaid(s); }}
                            className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-[#C8C9FF] text-[#5659D9] bg-[#ECEBFF] hover:bg-[#ECEBFF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[11px] font-[500] whitespace-nowrap"
                          >
                            {marking === s.id
                              ? <span className="w-3 h-3 border-2 border-[#7679FF]/40 border-t-[#7679FF] rounded-full animate-spin" />
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

      {/* Drawer — View Report detail */}
      {selected && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-[460px] bg-white border-l border-[#E4E4EF] shadow-xl flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[#E4E4EF]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusPill status={selected.status} />
                    {selected.referenceNumber && (
                      <span className="text-[11px] font-[500] text-[#62657A] bg-[#F0F0F8] px-2 py-0.5 rounded">
                        Ref: {selected.referenceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-[700] text-[#191A2E] leading-tight">{selected.employer.companyName}</p>
                  <p className="text-[12px] text-[#62657A] mt-0.5">{formatPayrollMonth(selected.payrollMonth)} · {selected.employer.companyCode}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E4E4EF] text-[#62657A] hover:text-[#62657A]"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Overdue warning */}
              {selected.status === "OVERDUE" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-[600] text-red-700">Payment overdue</p>
                    <p className="text-[11px] text-red-500 mt-0.5 leading-relaxed">
                      This settlement is past its due date. Employer has not remitted payment. Late fees may apply.
                    </p>
                  </div>
                </div>
              )}

              {/* Risk badge */}
              {selected.employer.riskStatus && selected.employer.riskStatus !== "LOW" && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertTriangle size={13} className="text-orange-500 flex-shrink-0" />
                  <p className="text-[12px] text-orange-700 font-[500]">Employer risk: <span className="font-[600]">{selected.employer.riskStatus}</span></p>
                </div>
              )}

              {/* Amount breakdown */}
              <div>
                <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Amount Breakdown</p>
                <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-1">
                  <InfoRow label="Principal"  value={formatCurrency(selected.principalAmount)} />
                  <InfoRow label="Interest"   value={formatCurrency(selected.interestAmount)} />
                  {parseFloat(selected.lateFeeAmount) > 0 && (
                    <InfoRow label="Late fee" value={formatCurrency(selected.lateFeeAmount)} accent />
                  )}
                  <div className="flex items-center justify-between py-3 border-t border-[#E4E4EF] mt-1">
                    <span className="text-[12px] font-[600] text-[#191A2E]">Total</span>
                    <span className="text-[14px] font-[700] text-[#191A2E] tabular-nums">{formatCurrency(selected.totalAmount)}</span>
                  </div>
                  {parseFloat(selected.outstandingAmount) > 0 && (
                    <div className="flex items-center justify-between py-2.5 border-t border-red-100">
                      <span className="text-[12px] font-[600] text-red-600">Outstanding</span>
                      <span className="text-[14px] font-[700] text-red-600 tabular-nums">{formatCurrency(selected.outstandingAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key dates */}
              <div>
                <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Key Dates</p>
                <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-1">
                  <InfoRow label="Due date"          value={formatDate(selected.dueDate)} accent={selected.status === "OVERDUE"} />
                  {selected.gracePeriodEnd && <InfoRow label="Grace period ends" value={formatDate(selected.gracePeriodEnd)} />}
                  {selected.paidDate && <InfoRow label="Paid on"            value={formatDate(selected.paidDate)} />}
                  <InfoRow label="Created"            value={formatDate(selected.createdAt)} />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-3">Status Timeline</p>
                <Timeline s={selected} />
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Notes</p>
                  <div className="bg-[#F7F7FB] border border-[#E4E4EF] rounded-xl px-4 py-3">
                    <p className="text-[12px] text-[#62657A] leading-relaxed">{selected.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — drawer actions */}
            <div className="px-5 py-4 border-t border-[#E4E4EF] space-y-2">
              {markError && (
                <p className="text-[11px] text-red-600 text-center">{markError}</p>
              )}

              {/* Send Report */}
              <button
                onClick={() => handleSendReport(selected)}
                disabled={sending === selected.id}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-[#7679FF] text-[#7679FF] text-[13px] font-[600] hover:bg-[#ECEBFF] disabled:opacity-50 transition-colors"
              >
                {sending === selected.id
                  ? <span className="w-4 h-4 border-2 border-[#7679FF]/30 border-t-[#7679FF] rounded-full animate-spin" />
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
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#7679FF] hover:bg-[#5659D9] text-white text-[13px] font-[600] disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 size={15} />
                    {marking === selected.id ? "Processing…" : "Mark as Paid"}
                  </button>
                  <p className="text-[11px] text-[#62657A] text-center">
                    Confirm receipt of {formatCurrency(selected.outstandingAmount || selected.totalAmount)} from {selected.employer.companyName}
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
