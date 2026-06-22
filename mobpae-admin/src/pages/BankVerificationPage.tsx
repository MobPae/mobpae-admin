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

  const { data = [], isLoading, isError, refetch } = useQuery<BankEmployerGroup[]>({
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
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Bank Verification</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Review and verify employee bank accounts by employer</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Clock size={14} />,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending",  val: pending  },
          { icon: <CheckCircle size={14} />, color: "text-[#7679FF]", bg: "bg-[#ECEBFF]", label: "Verified", val: verified },
          { icon: <CreditCard size={14} />,  color: "text-[#62657A]",   bg: "bg-[#F7F7FB]",   label: "Total",    val: total    },
        ].map(({ icon, color, bg, label, val }) => (
          <div key={label} className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
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
            placeholder="Search by employer name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF]/50 w-64 text-[#62657A] placeholder-[#B7B9C7]"
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
                    ? "bg-[#191A2E] text-white"
                    : "bg-white border border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF]"
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
            className="h-7 px-3 rounded-full text-[11px] font-[500] text-[#62657A] hover:text-[#62657A] border border-dashed border-[#E4E4EF] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isError ? (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load bank accounts</p>
          <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
          <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-[#F0F0F8] last:border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-32 bg-[#F0F0F8] rounded animate-pulse" />
                  <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
                </div>
                <div className="ml-auto h-4 w-14 bg-[#F0F0F8] rounded-full animate-pulse" />
              </div>
              <div className="ml-11 flex gap-3">
                <div className="h-2 w-24 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
            <span className="text-[#62657A] text-[18px]">🏦</span>
          </div>
          <p className="text-[13px] font-[500] text-[#62657A]">No employers found</p>
          <p className="text-[12px] text-[#62657A] mt-1">
            {search ? "No employers match your search." : "No bank accounts match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-[#62657A]">
            <span className="font-[500] text-[#62657A]">{rows.length}</span> employer{rows.length !== 1 ? "s" : ""}
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
