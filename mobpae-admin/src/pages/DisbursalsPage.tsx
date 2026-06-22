import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CreditCard, Clock, CheckCircle, XCircle, Calendar, X } from "lucide-react";
import { getDisbursals } from "../services/disbursalService";
import DisbursalsTable from "../components/disbursals/DisbursalsTable";
import DisbursalDrawer from "../components/disbursals/DisbursalDrawer";
import type { DisbursalStatus } from "../types/disbursal";
import type { Disbursal } from "../types/disbursal";

type FilterStatus = "ALL" | DisbursalStatus;

const CHIPS: { key: FilterStatus; label: string }[] = [
  { key: "ALL",       label: "All"       },
  { key: "PENDING",   label: "Pending"   },
  { key: "DISBURSED", label: "Disbursed" },
  { key: "FAILED",    label: "Failed"    },
];

export default function DisbursalsPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [selected, setSelected] = useState<Disbursal | null>(null);

  const serverFilters = {
    ...(filter !== "ALL" ? { status: filter as DisbursalStatus } : {}),
    ...(dateFrom ? { startDate: dateFrom } : {}),
    ...(dateTo   ? { endDate: dateTo }     : {}),
  };

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["disbursals", serverFilters],
    queryFn: () => getDisbursals(serverFilters),
  });

  const pending   = data.filter(d => d.status === "PENDING").length;
  const disbursed = data.filter(d => d.status === "DISBURSED").length;
  const failed    = data.filter(d => d.status === "FAILED").length;
  const total     = data.length;

  const rows = data.filter(d => {
    const q = search.toLowerCase();
    return (
      d.salaryRequest.employee.name.toLowerCase().includes(q) ||
      d.salaryRequest.employee.employeeCode.toLowerCase().includes(q) ||
      d.salaryRequest.employee.employer.companyName.toLowerCase().includes(q)
    );
  });

  const hasDateFilter = !!dateFrom || !!dateTo;

  return (
    <div className="px-8 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Disbursals</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Track and manage salary disbursals</p>
      </div>

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Clock size={14} />,        color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending",   val: pending   },
          { icon: <CheckCircle size={14} />,  color: "text-[#7679FF]", bg: "bg-[#ECEBFF]", label: "Disbursed", val: disbursed },
          { icon: <XCircle size={14} />,      color: "text-red-500",     bg: "bg-red-50",     label: "Failed",    val: failed    },
          { icon: <CreditCard size={14} />,   color: "text-[#62657A]",   bg: "bg-[#F7F7FB]",   label: "Total",     val: total     },
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
        {/* Text search */}
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

        {/* Status chips */}
        <div className="flex items-center gap-1.5">
          {CHIPS.map(c => {
            const count = c.key === "ALL" ? total
              : c.key === "PENDING" ? pending
              : c.key === "DISBURSED" ? disbursed
              : failed;
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

        {/* Date range */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Calendar size={13} className="text-[#62657A] flex-shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-8 px-2 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] text-[#62657A]"
          />
          <span className="text-[11px] text-[#62657A]">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-8 px-2 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] text-[#62657A]"
          />
          {hasDateFilter && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#62657A] hover:text-[#62657A] hover:bg-[#F0F0F8] transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load disbursals</p>
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
              <div className="h-2.5 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-4 w-14 bg-[#F0F0F8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
            <span className="text-[#62657A] text-lg">₹</span>
          </div>
          <p className="text-[13px] font-[500] text-[#62657A]">No disbursals found</p>
          <p className="text-[12px] text-[#62657A] mt-1">
            {hasDateFilter || filter !== "ALL" || search
              ? "No disbursals match your current filters."
              : "Disbursals are created when salary requests are approved for disbursal."}
          </p>
        </div>
      ) : (
        <DisbursalsTable
          disbursals={rows}
          selectedId={selected?.id ?? null}
          onSelect={d => setSelected(d)}
        />
      )}

      <DisbursalDrawer
        open={!!selected}
        disbursal={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          qc.invalidateQueries({ queryKey: ["disbursals"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
