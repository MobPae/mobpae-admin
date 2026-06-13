import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getSalaryRequests } from "../services/salaryRequestService";
import type { SalaryRequest, SalaryRequestStatus } from "../types/salary-request";
import SalaryRequestsTable from "../components/salary-requests/SalaryRequestsTable";
import SalaryRequestDrawer from "../components/salary-requests/SalaryRequestDrawer";

const CHIP_ON  = "bg-slate-900 text-white border-slate-900";
const CHIP_OFF = "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700";

const STATUS_LABELS: Record<SalaryRequestStatus, string> = {
  SUBMITTED:            "Submitted",
  EMPLOYER_APPROVED:    "Emp. Approved",
  EMPLOYER_REJECTED:    "Rejected",
  READY_FOR_DISBURSAL:  "Ready",
  DISBURSED:            "Disbursed",
  REPAYMENT_SCHEDULED:  "Repayment",
  REPAID:               "Repaid",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as SalaryRequestStatus[];

export default function SalaryRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"ALL" | SalaryRequestStatus>("ALL");
  const [selected, setSelected]           = useState<SalaryRequest | null>(null);

  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length;
    return acc;
  }, {});

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.employee.name.toLowerCase().includes(q) ||
      r.employee.employeeCode.toLowerCase().includes(q) ||
      r.employee.employer.companyName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pipeline = [
    { label: "Submitted",   key: "SUBMITTED" as const,           color: "bg-amber-400",   text: "text-amber-600"   },
    { label: "Emp Approved",key: "EMPLOYER_APPROVED" as const,   color: "bg-blue-400",    text: "text-blue-600"    },
    { label: "Ready",       key: "READY_FOR_DISBURSAL" as const, color: "bg-indigo-400",  text: "text-indigo-600"  },
    { label: "Disbursed",   key: "DISBURSED" as const,           color: "bg-emerald-400", text: "text-emerald-600" },
  ];

  const total = requests.length;

  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-[15px] font-[500] text-slate-900 leading-none">Salary Requests</h1>
        <p className="text-[11px] text-slate-400 mt-1.5">Review and process employee salary advance requests</p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-lg px-4 py-2.5">
          Could not load salary requests.
        </div>
      )}

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {pipeline.map(({ label, key, color, text }) => {
          const count = counts[key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
              className={`bg-white border rounded-lg p-3.5 text-left transition-colors ${statusFilter === key ? "border-slate-300" : "border-slate-100 hover:border-slate-200"}`}
            >
              <p className="text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400 leading-none">{label}</p>
              <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${text} ${isLoading ? "opacity-20 animate-pulse" : ""}`}>{count}</p>
              <div className="h-[3px] rounded-full bg-slate-100 mt-2.5">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-56 text-[12px] bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === "ALL" ? CHIP_ON : CHIP_OFF}`}
          >
            All · {total}
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === s ? CHIP_ON : CHIP_OFF}`}
            >
              {STATUS_LABELS[s]} · {counts[s] ?? 0}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl py-14 text-center">
          <p className="text-[13px] font-[500] text-slate-700">No requests found</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filter." : "No salary requests submitted yet."}
          </p>
        </div>
      ) : (
        <SalaryRequestsTable
          requests={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(r) => setSelected(selected?.id === r.id ? null : r)}
        />
      )}

      <SalaryRequestDrawer
        open={selected !== null}
        request={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          void queryClient.invalidateQueries({ queryKey: ["salary-requests"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
