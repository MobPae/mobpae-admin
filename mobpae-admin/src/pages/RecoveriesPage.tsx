import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { getRepayments } from "../services/repaymentService";
import type { Repayment } from "../types/repayment";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const fmtCurrency = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return fmt.format(Number.isFinite(n) ? n : 0);
};

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
};

// Map repayment status → display config
const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  SCHEDULED: { label: "Awaiting Payroll", dot: "bg-[#D97706]", text: "text-[#B45309]", bg: "bg-[#FEF3C7]" },
  OVERDUE:   { label: "Overdue",          dot: "bg-red-400",   text: "text-red-600",   bg: "bg-red-50"     },
  PAID:      { label: "Recovered",        dot: "bg-[#22C55E]", text: "text-[#15803D]", bg: "bg-[#DCFCE7]"  },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#D1D5DB]" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-[500] ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── filter chips ──────────────────────────────────────────────────────────────

const FILTERS = [
  { label: "All",             value: "ALL"       },
  { label: "Awaiting Payroll",value: "SCHEDULED" },
  { label: "Overdue",         value: "OVERDUE"   },
  { label: "Recovered",       value: "PAID"      },
] as const;

type FilterValue = "ALL" | "SCHEDULED" | "OVERDUE" | "PAID";

// ── row type (from GET /repayments) ──────────────────────────────────────────

interface RecoveryRow {
  id: string;
  loanApplicationId: string;
  employeeName: string;
  employeeCode: string;
  companyName: string;
  companyCode: string;
  principalAmount: string;
  interestAmount: string;
  totalRecoveryAmount: string;
  recoveryDate: string | null;
  status: string;
  paidDate: string | null;
  raw: Repayment;
}

function toRecoveryRow(r: Repayment): RecoveryRow {
  return {
    id: r.id,
    loanApplicationId: r.loanApplicationId,
    employeeName: r.loanApplication.employee.name,
    employeeCode: r.loanApplication.employee.employeeCode,
    companyName: r.loanApplication.employee.employer.companyName,
    companyCode: r.loanApplication.employee.employer.companyCode,
    principalAmount: r.principalAmount,
    interestAmount: r.interestAmount,
    totalRecoveryAmount: r.totalAmount,
    recoveryDate: r.dueDate ?? null,
    status: r.status,
    paidDate: r.paidDate,
    raw: r,
  };
}

// ── info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-[12px] text-[#6B7280]">{label}</span>
      <span className={`text-[12px] font-[500] ${accent ? "text-red-600" : "text-[#111827]"}`}>{value}</span>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function RecoveriesPage() {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterValue>("ALL");
  const [selected, setSelected] = useState<RecoveryRow | null>(null);

  const { data: repayments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["repayments"],
    queryFn: getRepayments,
  });

  // Map repayments directly to recovery rows
  const allRows = useMemo(() => repayments.map(toRecoveryRow), [repayments]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: allRows.length };
    allRows.forEach(r => {
      m[r.status] = (m[r.status] ?? 0) + 1;
    });
    return m;
  }, [allRows]);

  const totalRecovered = useMemo(() =>
    allRows
      .filter(r => r.status === "PAID")
      .reduce((s, r) => s + (parseFloat(r.totalRecoveryAmount) || 0), 0),
    [allRows]
  );

  const totalOutstanding = useMemo(() =>
    allRows
      .filter(r => r.status !== "PAID")
      .reduce((s, r) => s + (parseFloat(r.totalRecoveryAmount) || 0), 0),
    [allRows]
  );

  const rows = useMemo(() =>
    allRows.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.companyCode.toLowerCase().includes(q);
      if (filter === "ALL") return matchSearch;
      return matchSearch && r.status === filter;
    }),
    [allRows, search, filter]
  );

  return (
    <div className="px-8 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-[#111827] tracking-[-0.01em]">Recoveries</h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">Salary advance recoveries derived from disbursed requests</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28, marginTop: 24 }}>
        {[
          { label: "Awaiting Payroll", val: counts["SCHEDULED"] ?? 0,  icon: <Clock3 size={14} />,          bg: "bg-sky-50",    color: "text-sky-600"   },
          { label: "Overdue",          val: counts["OVERDUE"]   ?? 0,  icon: <AlertTriangle size={14} />,   bg: "bg-red-50",    color: "text-red-600"   },
          { label: "Recovered",        val: counts["PAID"]      ?? 0,  icon: <CheckCircle2 size={14} />,    bg: "bg-[#F3F0FF]", color: "text-[#6C4CFF]" },
          { label: "Total recovered", val: fmtCurrency(totalRecovered),                                  icon: <CircleDollarSign size={14} />,bg: "bg-[#F3F4F6]",  color: "text-[#6B7280]"   },
        ].map(({ label, val, icon, bg, color }) => (
          <div key={label} className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div>
              <p className="text-[20px] font-[600] text-[#111827] leading-none tabular-nums">{val}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Outstanding banner */}
      {totalOutstanding > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-[12px] text-amber-700">
            <span className="font-[600]">{fmtCurrency(totalOutstanding)}</span> in outstanding recovery amounts across active salary advances
          </p>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search employee, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#6C4CFF] w-64 text-[#6B7280] placeholder-[#D1D5DB]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 rounded-full text-[12px] font-[500] transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-[#111827] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB]"
              }`}
            >
              {f.label}
              {f.value === "ALL" && (
                <span className={`text-[11px] font-[700] ${filter === "ALL" ? "text-white/60" : "text-[#6B7280]"}`}>{counts["ALL"] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {isError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[13px] font-[500] text-red-600">Failed to load recoveries</p>
            <p className="text-[12px] text-[#6B7280] mt-1">Check your connection and try again.</p>
            <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FC] transition-colors text-[#6B7280]">
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0">
                <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-28 bg-[#F3F4F6] rounded animate-pulse" />
                  <div className="h-2 w-16 bg-[#F3F4F6] rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-16 bg-[#F3F4F6] rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-[#F3F4F6] rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-[#F3F4F6] rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#F3F4F6] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-3 mx-auto">
              <RefreshCcw size={18} className="text-[#6B7280]" />
            </div>
            <p className="text-[13px] font-[500] text-[#6B7280]">No recoveries found</p>
            <p className="text-[12px] text-[#6B7280] mt-1">Recoveries appear once salary advances are disbursed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["Employee", "Employer", "Principal", "Interest", "Total Recovery", "Recovery Date", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-[#6B7280] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map(r => (
                  <tr
                    key={r.loanApplicationId}
                    onClick={() => setSelected(r)}
                    className={`cursor-pointer hover:bg-[#F8F9FC]/60 transition-colors ${selected?.loanApplicationId === r.loanApplicationId ? "bg-[#F3F0FF]/30" : ""} ${r.status === "OVERDUE" ? "bg-red-50/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-[500] text-[#111827]">{r.employeeName}</p>
                      <p className="text-[11px] text-[#6B7280]">{r.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{r.companyName}</td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-[#111827] whitespace-nowrap">{fmtCurrency(r.principalAmount)}</td>
                    <td className="px-4 py-3 tabular-nums text-[#6B7280] whitespace-nowrap">
                      {parseFloat(r.interestAmount) > 0 ? fmtCurrency(r.interestAmount) : <span className="text-[#6B7280]">—</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-[#111827] whitespace-nowrap">{fmtCurrency(r.totalRecoveryAmount)}</td>
                    <td className={`px-4 py-3 tabular-nums whitespace-nowrap ${r.status === "OVERDUE" ? "text-red-600 font-[500]" : "text-[#6B7280]"}`}>
                      {fmtDate(r.recoveryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5 text-[12px] font-[500] text-[#6C4CFF] whitespace-nowrap">
                        View <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-[460px] bg-white border-l border-[#E5E7EB] shadow-xl flex flex-col">
            <div className="px-5 pt-5 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1.5">
                    <StatusPill status={selected.status} />
                  </div>
                  <p className="text-[16px] font-[700] text-[#111827]">{selected.employeeName}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">{selected.employeeCode} · {selected.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#6B7280]">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {selected.status === "OVERDUE" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-[600] text-red-700">Recovery overdue</p>
                    <p className="text-[11px] text-red-500 mt-0.5">This recovery is past its scheduled date.</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-[600] text-[#6B7280] uppercase tracking-[0.07em] mb-2">Recovery Amounts</p>
                <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-1">
                  <InfoRow label="Principal amount"    value={fmtCurrency(selected.principalAmount)} />
                  <InfoRow label="Interest amount"     value={parseFloat(selected.interestAmount) > 0 ? fmtCurrency(selected.interestAmount) : "—"} />
                  <div className="flex items-center justify-between py-3 border-t border-[#E5E7EB] mt-1">
                    <span className="text-[12px] font-[600] text-[#111827]">Total recovery</span>
                    <span className="text-[14px] font-[700] text-[#111827] tabular-nums">{fmtCurrency(selected.totalRecoveryAmount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-[600] text-[#6B7280] uppercase tracking-[0.07em] mb-2">Dates</p>
                <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-1">
                  <InfoRow label="Recovery date"   value={fmtDate(selected.recoveryDate)} accent={selected.status === "OVERDUE"} />
                  <InfoRow label="Paid on"          value={fmtDate(selected.paidDate)} />
                  <InfoRow label="Created"          value={fmtDate(selected.raw.createdAt)} />
                </div>
              </div>

              {selected.raw.remarks && (
                <div>
                  <p className="text-[11px] font-[600] text-[#6B7280] uppercase tracking-[0.07em] mb-2">Remarks</p>
                  <div className="bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-4 py-3">
                    <p className="text-[12px] text-[#6B7280] leading-relaxed">{selected.raw.remarks}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
