import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Calendar, CheckCircle, AlertTriangle, DollarSign, X, Download } from "lucide-react";
import { getRepayments } from "../services/repaymentService";
import { exportToCsv } from "../utils/exportCsv";
import RepaymentsTable from "../components/repayments/RepaymentsTable";
import RepaymentDrawer from "../components/repayments/RepaymentDrawer";
import type { Repayment, RepaymentStatus } from "../types/repayment";

type FilterStatus = "ALL" | RepaymentStatus;

const CHIPS: { key: FilterStatus; label: string }[] = [
  { key: "ALL",       label: "All"       },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "PAID",      label: "Paid"      },
  { key: "OVERDUE",   label: "Overdue"   },
];

export default function RepaymentsPage() {
  const queryClient = useQueryClient();

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("ALL");
  const [selected, setSelected] = useState<Repayment | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["repayments"],
    queryFn: getRepayments,
  });

  const scheduled = data.filter(r => r.status === "SCHEDULED").length;
  const paid      = data.filter(r => r.status === "PAID").length;
  const overdue   = data.filter(r => r.status === "OVERDUE").length;
  const total     = data.length;

  const rows = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      r.salaryRequest.employee.name.toLowerCase().includes(q) ||
      r.salaryRequest.employee.employeeCode.toLowerCase().includes(q) ||
      r.salaryRequest.employee.employer.companyName.toLowerCase().includes(q);
    const matchFilter = filter === "ALL" || r.status === filter;
    const due = r.dueDate ? new Date(r.dueDate) : null;
    const matchFrom = !dateFrom || (due !== null && due >= new Date(dateFrom));
    const matchTo   = !dateTo   || (due !== null && due <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchFilter && matchFrom && matchTo;
  });

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Repayments</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Track employee salary advance repayments</p>
      </div>

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Calendar size={14} />,        color: "text-[#7679FF]",    bg: "bg-[#ECEBFF]",    label: "Scheduled", val: scheduled },
          { icon: <CheckCircle size={14} />,     color: "text-[#7679FF]", bg: "bg-[#ECEBFF]", label: "Paid",      val: paid      },
          { icon: <AlertTriangle size={14} />,   color: "text-red-500",     bg: "bg-red-50",     label: "Overdue",   val: overdue   },
          { icon: <DollarSign size={14} />,      color: "text-[#62657A]",   bg: "bg-[#F7F7FB]",   label: "Total",     val: total     },
        ].map(({ icon, color, bg, label, val }) => (
          <div key={label} className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{val}</p>
              <p className="text-[11px] text-[#62657A] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search by name, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] w-64 text-[#62657A] placeholder-[#B7B9C7]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {CHIPS.map(c => {
            const count = c.key === "ALL" ? total
              : c.key === "SCHEDULED" ? scheduled
              : c.key === "PAID" ? paid
              : overdue;
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`h-7 px-3 rounded-full text-[11px] font-[500] transition-colors ${
                  active ? "bg-[#191A2E] text-white" : "bg-white border border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF]"
                }`}
              >
                {c.label} · {count}
              </button>
            );
          })}
        </div>

        {/* Date range (filters by dueDate) */}
        <div className="flex items-center gap-1.5 ml-1">
          <Calendar size={12} className="text-[#62657A]" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-7 px-2 text-[11px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors text-[#62657A]"
          />
          <span className="text-[11px] text-[#62657A]">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-7 px-2 text-[11px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors text-[#62657A]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[#F0F0F8] text-[#62657A] hover:bg-[#E4E4EF] transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-[#62657A]">{rows.length} result{rows.length !== 1 ? "s" : ""}</span>
        <button
          onClick={() => exportToCsv(rows.map(r => ({
            Employee:    r.salaryRequest.employee.name,
            Code:        r.salaryRequest.employee.employeeCode,
            Company:     r.salaryRequest.employee.employer.companyName,
            Principal:   r.principalAmount,
            Total:       r.totalAmount,
            DueDate:     r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "",
            PaidDate:    r.paidDate ? new Date(r.paidDate).toLocaleDateString() : "",
            Status:      r.status,
          })), `repayments-${Date.now()}`)}
          className="h-8 px-3 flex items-center gap-1.5 text-[12px] font-[500] text-[#62657A] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {isError ? (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load repayments</p>
          <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
          <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F0F0F8] last:border-0">
              <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-28 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-16 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
            <span className="text-[#62657A] text-lg">↩</span>
          </div>
          <p className="text-[13px] font-[500] text-[#62657A]">No repayments found</p>
          <p className="text-[12px] text-[#62657A] mt-1">Repayments appear once salary advances are disbursed.</p>
        </div>
      ) : (
        <RepaymentsTable
          repayments={rows}
          selectedId={selected?.id ?? null}
          onSelect={r => setSelected(r)}
        />
      )}

      <RepaymentDrawer
        open={!!selected}
        repayment={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          void queryClient.invalidateQueries({ queryKey: ["repayments"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
