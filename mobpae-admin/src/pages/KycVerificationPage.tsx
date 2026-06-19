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

  const { data = [], isLoading } = useQuery<KycEmployeeGroup[]>({
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
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">KYC Verification</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Review and approve employee KYC documents</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Clock size={14} />,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending docs",  val: pending  },
          { icon: <CheckCircle size={14} />, color: "text-emerald-500", bg: "bg-emerald-50", label: "Verified docs", val: verified },
          { icon: <XCircle size={14} />,     color: "text-red-500",     bg: "bg-red-50",     label: "Rejected docs", val: rejected },
          { icon: <FileText size={14} />,    color: "text-slate-500",   bg: "bg-slate-50",   label: "Total docs",    val: total    },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-[#059669]/50 w-64 text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Employer filter */}
        {employers.length > 0 && (
          <div className="relative">
            <select
              value={employerId}
              onChange={e => setEmployerId(e.target.value)}
              className="h-8 pl-3 pr-7 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-[#059669]/50 text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">All employers</option>
              {employers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
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
            className="h-7 px-3 rounded-full text-[11px] font-[500] text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table / empty states */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-12 text-center">
          <p className="text-[13px] text-slate-400">Loading KYC data…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-12 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">No employees found</p>
          <p className="text-[12px] text-slate-400 mt-1">
            {search ? "No employees match your search." : "No KYC submissions match the selected filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-slate-400">
              <span className="font-[500] text-slate-700">{rows.length}</span> employee{rows.length !== 1 ? "s" : ""}
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
