import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import { getRepayments } from "../services/repaymentService";
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
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("ALL");
  const [selected, setSelected] = useState<Repayment | null>(null);

  const { data = [], isLoading } = useQuery({
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
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Repayments</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Track employee salary advance repayments</p>
      </div>

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Calendar size={14} />,        color: "text-blue-500",    bg: "bg-blue-50",    label: "Scheduled", val: scheduled },
          { icon: <CheckCircle size={14} />,     color: "text-emerald-500", bg: "bg-emerald-50", label: "Paid",      val: paid      },
          { icon: <AlertTriangle size={14} />,   color: "text-red-500",     bg: "bg-red-50",     label: "Overdue",   val: overdue   },
          { icon: <DollarSign size={14} />,      color: "text-slate-500",   bg: "bg-slate-50",   label: "Total",     val: total     },
        ].map(({ icon, color, bg, label, val }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{val}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-64 text-slate-700 placeholder-slate-400"
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
                  active ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {c.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-400">Loading repayments…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">No repayments found</p>
          <p className="text-[12px] text-slate-400 mt-1">Repayments appear once salary advances are disbursed.</p>
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
      />
    </div>
  );
}
