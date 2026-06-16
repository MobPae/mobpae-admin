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
import { getSalaryRequests } from "../services/salaryRequestService";
import type { SalaryRequest } from "../types/salary-request";

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

// Salary requests in recovery flow
const RECOVERY_STATUSES = new Set(["DISBURSED", "REPAYMENT_SCHEDULED", "REPAID"]);

// Map internal repayment status → recovery terminology
const RECOVERY_STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  SCHEDULED: { label: "Awaiting Payroll", bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400"     },
  OVERDUE:   { label: "Overdue",          bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400"     },
  PAID:      { label: "Recovered",        bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
};

// Fallback for salary request level status when no repayment record yet
const SR_STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  DISBURSED:            { label: "Awaiting schedule", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400"   },
  REPAYMENT_SCHEDULED:  { label: "Awaiting Payroll",  bg: "bg-sky-50",    text: "text-sky-700",   dot: "bg-sky-400"     },
  REPAID:               { label: "Recovered",          bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-400" },
};

function StatusPill({ repaymentStatus, srStatus }: { repaymentStatus?: string; srStatus: string }) {
  const cfg = repaymentStatus
    ? (RECOVERY_STATUS_CFG[repaymentStatus] ?? { label: repaymentStatus, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" })
    : (SR_STATUS_CFG[srStatus] ?? { label: srStatus, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" });
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

// ── row type (derived from salary request) ────────────────────────────────────

interface RecoveryRow {
  id: string;
  salaryRequestId: string;
  employeeName: string;
  employeeCode: string;
  companyName: string;
  companyCode: string;
  principalAmount: string;
  interestAmount: string;
  totalRecoveryAmount: string;
  recoveryDate: string | null;
  repaymentStatus: string | undefined;
  srStatus: string;
  raw: SalaryRequest;
}

function toRecoveryRow(sr: SalaryRequest): RecoveryRow {
  const principal = sr.approvedAmount ?? sr.amount;
  const total = sr.repayment?.totalAmount ?? principal;
  const principalNum = parseFloat(principal) || 0;
  const totalNum = parseFloat(total) || 0;
  const interestNum = Math.max(0, totalNum - principalNum);

  return {
    id: sr.repayment?.id ?? sr.id,
    salaryRequestId: sr.id,
    employeeName: sr.employee.name,
    employeeCode: sr.employee.employeeCode,
    companyName: sr.employee.employer.companyName,
    companyCode: sr.employee.employer.companyCode,
    principalAmount: principal,
    interestAmount: interestNum.toFixed(2),
    totalRecoveryAmount: total,
    recoveryDate: sr.repayment?.dueDate ?? sr.repaymentDate ?? null,
    repaymentStatus: sr.repayment?.status,
    srStatus: sr.status,
    raw: sr,
  };
}

// ── info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className={`text-[12px] font-[500] ${accent ? "text-red-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function RecoveriesPage() {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterValue>("ALL");
  const [selected, setSelected] = useState<RecoveryRow | null>(null);

  const { data: salaryRequests = [], isLoading } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  // Derive recovery rows from salary requests in recovery flow
  const allRows = useMemo(() =>
    salaryRequests
      .filter(sr => RECOVERY_STATUSES.has(sr.status))
      .map(toRecoveryRow),
    [salaryRequests]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: allRows.length };
    allRows.forEach(r => {
      const key = r.repaymentStatus ?? r.srStatus;
      m[key] = (m[key] ?? 0) + 1;
    });
    return m;
  }, [allRows]);

  const totalRecovered = useMemo(() =>
    allRows
      .filter(r => r.repaymentStatus === "PAID" || r.srStatus === "REPAID")
      .reduce((s, r) => s + (parseFloat(r.totalRecoveryAmount) || 0), 0),
    [allRows]
  );

  const totalOutstanding = useMemo(() =>
    allRows
      .filter(r => r.repaymentStatus !== "PAID" && r.srStatus !== "REPAID")
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
      const rowStatus = r.repaymentStatus ?? r.srStatus;
      return matchSearch && rowStatus === filter;
    }),
    [allRows, search, filter]
  );

  return (
    <div className="px-8 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Recoveries</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Salary advance recoveries derived from disbursed requests</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Awaiting Payroll", val: (counts["SCHEDULED"] ?? 0) + (counts["REPAYMENT_SCHEDULED"] ?? 0), icon: <Clock3 size={14} />, bg: "bg-sky-50", color: "text-sky-600" },
          { label: "Overdue",    val: counts["OVERDUE"] ?? 0,                                             icon: <AlertTriangle size={14} />,   bg: "bg-red-50",     color: "text-red-600"     },
          { label: "Recovered",  val: (counts["PAID"] ?? 0) + (counts["REPAID"] ?? 0),                   icon: <CheckCircle2 size={14} />,    bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Total recovered", val: fmtCurrency(totalRecovered),                                  icon: <CircleDollarSign size={14} />,bg: "bg-slate-100",  color: "text-slate-600"   },
        ].map(({ label, val, icon, bg, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div>
              <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{val}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
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
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-64 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 rounded-full text-[12px] font-[500] transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
              {f.value === "ALL" && (
                <span className={`text-[10px] font-[700] ${filter === "ALL" ? "text-white/60" : "text-slate-400"}`}>{counts["ALL"] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center"><p className="text-[13px] text-slate-400">Loading recoveries…</p></div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 mx-auto">
              <RefreshCcw size={18} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-[500] text-slate-500">No recoveries found</p>
            <p className="text-[12px] text-slate-400 mt-1">Recoveries appear once salary advances are disbursed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Employee", "Employer", "Principal", "Interest", "Total Recovery", "Recovery Date", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(r => (
                  <tr
                    key={r.salaryRequestId}
                    onClick={() => setSelected(r)}
                    className={`cursor-pointer hover:bg-slate-50/60 transition-colors ${selected?.salaryRequestId === r.salaryRequestId ? "bg-blue-50/30" : ""} ${r.repaymentStatus === "OVERDUE" ? "bg-red-50/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-[500] text-slate-800">{r.employeeName}</p>
                      <p className="text-[10px] text-slate-400">{r.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.companyName}</td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-slate-800 whitespace-nowrap">{fmtCurrency(r.principalAmount)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-500 whitespace-nowrap">
                      {parseFloat(r.interestAmount) > 0 ? fmtCurrency(r.interestAmount) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-slate-800 whitespace-nowrap">{fmtCurrency(r.totalRecoveryAmount)}</td>
                    <td className={`px-4 py-3 tabular-nums whitespace-nowrap ${r.repaymentStatus === "OVERDUE" ? "text-red-600 font-[500]" : "text-slate-500"}`}>
                      {fmtDate(r.recoveryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill repaymentStatus={r.repaymentStatus} srStatus={r.srStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5 text-[12px] font-[500] text-blue-500 whitespace-nowrap">
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
          <div className="fixed inset-y-0 right-0 z-40 w-[460px] bg-white border-l border-slate-200 shadow-xl flex flex-col">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1.5">
                    <StatusPill repaymentStatus={selected.repaymentStatus} srStatus={selected.srStatus} />
                  </div>
                  <p className="text-[16px] font-[700] text-slate-900">{selected.employeeName}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{selected.employeeCode} · {selected.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {selected.repaymentStatus === "OVERDUE" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-[600] text-red-700">Recovery overdue</p>
                    <p className="text-[11px] text-red-500 mt-0.5">This recovery is past its scheduled date.</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Recovery Amounts</p>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
                  <InfoRow label="Principal amount"    value={fmtCurrency(selected.principalAmount)} />
                  <InfoRow label="Interest amount"     value={parseFloat(selected.interestAmount) > 0 ? fmtCurrency(selected.interestAmount) : "—"} />
                  <div className="flex items-center justify-between py-3 border-t border-slate-100 mt-1">
                    <span className="text-[12px] font-[600] text-slate-800">Total recovery</span>
                    <span className="text-[14px] font-[700] text-slate-900 tabular-nums">{fmtCurrency(selected.totalRecoveryAmount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Dates</p>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
                  <InfoRow label="Recovery date"   value={fmtDate(selected.recoveryDate)} accent={selected.repaymentStatus === "OVERDUE"} />
                  <InfoRow label="Disbursed"        value={fmtDate(selected.raw.disbursal?.disbursedAt)} />
                  <InfoRow label="Request date"     value={fmtDate(selected.raw.requestedAt)} />
                </div>
              </div>

              {selected.raw.remarks && (
                <div>
                  <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Remarks</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <p className="text-[12px] text-slate-600 leading-relaxed">{selected.raw.remarks}</p>
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
