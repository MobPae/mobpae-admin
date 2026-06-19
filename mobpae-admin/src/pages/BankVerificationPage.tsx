import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, CreditCard } from "lucide-react";
import { getBankGroupedByEmployer } from "../services/bankVerificationService";
import type { BankVerificationFilter } from "../services/bankVerificationService";
import BankGroupedTable from "../components/bank-verification/BankGroupedTable";
import BankGroupedDrawer from "../components/bank-verification/BankGroupedDrawer";
import type { BankEmployerGroup } from "../types/bankAccount";

const CHIPS: { key: BankVerificationFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
];

export default function BankVerificationPage() {
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<BankVerificationFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryKey = ["bank-grouped", filter];

  const { data = [], isLoading } = useQuery<BankEmployerGroup[]>({
    queryKey,
    queryFn: () => getBankGroupedByEmployer({ status: filter }),
  });

  // Aggregate stats
  const pending  = data.reduce((n, g) => n + g.pendingCount,  0);
  const verified = data.reduce((n, g) => n + g.verifiedCount, 0);
  const total    = data.reduce((n, g) => n + g.totalAccounts,  0);

  // Client-side search
  const rows = data.filter(g => {
    const q = search.toLowerCase();
    return (
      g.companyName.toLowerCase().includes(q) ||
      g.companyCode.toLowerCase().includes(q)
    );
  });

  // Live drawer data
  const selectedGroup = useMemo(
    () => (selectedId ? data.find(g => g.employerId === selectedId) ?? null : null),
    [data, selectedId]
  );

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Bank Verification</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Review and verify employee bank accounts by employer</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Clock size={14} />,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending",  val: pending  },
          { icon: <CheckCircle size={14} />, color: "text-emerald-500", bg: "bg-emerald-50", label: "Verified", val: verified },
          { icon: <CreditCard size={14} />,  color: "text-slate-500",   bg: "bg-slate-50",   label: "Total",    val: total    },
        ].map(({ icon, color, bg, label, val }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
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
            placeholder="Search by employer name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-[#059669]/50 w-64 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {CHIPS.map(c => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`h-7 px-3 rounded-full text-[11px] font-[500] transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {(search || filter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setFilter("ALL"); }}
            className="h-7 px-3 rounded-full text-[11px] font-[500] text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-12 text-center">
          <p className="text-[13px] text-slate-400">Loading bank accounts…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-12 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">No employers found</p>
          <p className="text-[12px] text-slate-400 mt-1">
            {search ? "No employers match your search." : "No bank accounts match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-slate-400">
            <span className="font-[500] text-slate-700">{rows.length}</span> employer{rows.length !== 1 ? "s" : ""}
          </p>
          <BankGroupedTable
            groups={rows}
            selectedId={selectedId}
            onSelect={g => setSelectedId(g.employerId)}
          />
        </>
      )}

      <BankGroupedDrawer
        open={!!selectedGroup}
        group={selectedGroup}
        queryKey={queryKey}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
