import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, XCircle, FileText, ChevronDown } from "lucide-react";
import { getKycGrouped } from "../services/kycService";
import KycGroupedTable from "../components/kyc/KycGroupedTable";
import KycGroupedDrawer from "../components/kyc/KycGroupedDrawer";
import type { KycEmployeeGroup } from "../types/kyc";

type StatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
  { key: "REJECTED", label: "Rejected" },
];

export default function KycVerificationPage() {
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState<StatusFilter>("ALL");
  const [employerId, setEmployerId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryKey = ["kyc-grouped", employerId, status];

  const { data = [], isLoading, isError, refetch } = useQuery<KycEmployeeGroup[]>({
    queryKey,
    queryFn: () =>
      getKycGrouped({
        ...(employerId ? { employerId } : {}),
        ...(status !== "ALL" ? { status } : {}),
      }),
  });

  // Derive employer list for filter dropdown
  const employers = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(g => {
      if (g.employerId) map.set(g.employerId, g.companyName);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  // Stats from the full dataset
  const pending  = data.reduce((n, g) => n + g.pendingCount,  0);
  const verified = data.reduce((n, g) => n + g.verifiedCount, 0);
  const rejected = data.reduce((n, g) => n + g.rejectedCount, 0);
  const total    = data.reduce((n, g) => n + g.submittedCount, 0);

  // Client-side search filter
  const rows = data.filter(g => {
    const q = search.toLowerCase();
    return (
      g.employeeName.toLowerCase().includes(q) ||
      g.employeeCode.toLowerCase().includes(q) ||
      g.companyName.toLowerCase().includes(q)
    );
  });

  // Keep drawer data live — re-derives whenever query refreshes
  const selectedGroup = useMemo(
    () => (selectedId ? data.find(g => g.employeeId === selectedId) ?? null : null),
    [data, selectedId]
  );

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">KYC Verification</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Review and approve employee KYC documents</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Clock size={14} />,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending docs",  val: pending  },
          { icon: <CheckCircle size={14} />, color: "text-[#7679FF]", bg: "bg-[#ECEBFF]", label: "Verified docs", val: verified },
          { icon: <XCircle size={14} />,     color: "text-red-500",     bg: "bg-red-50",     label: "Rejected docs", val: rejected },
          { icon: <FileText size={14} />,    color: "text-[#62657A]",   bg: "bg-[#F7F7FB]",   label: "Total docs",    val: total    },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search by name, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF]/50 w-64 text-[#62657A] placeholder-[#B7B9C7]"
          />
        </div>

        {/* Employer filter */}
        {employers.length > 0 && (
          <div className="relative">
            <select
              value={employerId}
              onChange={e => setEmployerId(e.target.value)}
              className="h-8 pl-3 pr-7 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF]/50 text-[#62657A] appearance-none cursor-pointer"
            >
              <option value="">All employers</option>
              {employers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#62657A] pointer-events-none" />
          </div>
        )}

        {/* Status chips */}
        <div className="flex items-center gap-1.5">
          {STATUS_CHIPS.map(c => {
            const active = status === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setStatus(c.key)}
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

        {/* Clear */}
        {(search || employerId || status !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setEmployerId(""); setStatus("ALL"); }}
            className="h-7 px-3 rounded-full text-[11px] font-[500] text-[#62657A] hover:text-[#62657A] border border-dashed border-[#E4E4EF] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table / empty states */}
      {isError ? (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load KYC data</p>
          <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
          <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F0F0F8] last:border-0">
              <div className="w-8 h-8 rounded-full bg-[#F0F0F8] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-32 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-24 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
              <div className="h-4 w-14 bg-[#F0F0F8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
            <span className="text-[#62657A] text-[18px]">🪪</span>
          </div>
          <p className="text-[13px] font-[500] text-[#62657A]">No employees found</p>
          <p className="text-[12px] text-[#62657A] mt-1">
            {search ? "No employees match your search." : "No KYC submissions match the selected filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#62657A]">
              <span className="font-[500] text-[#62657A]">{rows.length}</span> employee{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <KycGroupedTable
            groups={rows}
            selectedId={selectedId}
            onSelect={g => setSelectedId(g.employeeId)}
          />
        </>
      )}

      <KycGroupedDrawer
        open={!!selectedGroup}
        group={selectedGroup}
        groupQueryKey={queryKey}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
