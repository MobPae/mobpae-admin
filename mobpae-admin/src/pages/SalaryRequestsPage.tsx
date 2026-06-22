import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, Calendar, X } from "lucide-react";
import { exportToCsv } from "../utils/exportCsv";
import { getSalaryRequests } from "../services/salaryRequestService";
import type { SalaryRequest, SalaryRequestStatus } from "../types/salary-request";
import SalaryRequestsTable from "../components/salary-requests/SalaryRequestsTable";
import SalaryRequestDrawer from "../components/salary-requests/SalaryRequestDrawer";
import { Pagination } from "../components/ui/Pagination";

const PAGE_SIZE = 15;

const CHIP_ON       = "bg-[#191A2E] text-white border-[#191A2E]";
const CHIP_OFF      = "bg-white border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF] hover:text-[#62657A]";
const CHIP_ACTION   = "bg-[#7679FF] text-white border-[#5659D9]";
const CHIP_ACTION_OFF = "bg-[#ECEBFF] border-[#E4E4EF] text-[#5659D9] hover:border-[#7679FF]";

const NEEDS_ACTION_STATUSES: SalaryRequestStatus[] = ["EMPLOYER_APPROVED", "READY_FOR_DISBURSAL"];

const STATUS_LABELS: Record<SalaryRequestStatus, string> = {
  SUBMITTED:            "Submitted",
  EMPLOYER_APPROVED:    "Employer approved",
  EMPLOYER_REJECTED:    "Rejected",
  READY_FOR_DISBURSAL:  "Ready for disbursal",
  DISBURSED:            "Disbursed",
  REPAYMENT_SCHEDULED:  "Payment scheduled",
  REPAID:               "Repaid",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as SalaryRequestStatus[];

export default function SalaryRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"ALL" | "NEEDS_ACTION" | SalaryRequestStatus>("ALL");
  const [selected, setSelected]           = useState<SalaryRequest | null>(null);
  const [page, setPage]                   = useState(1);
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo,   setDateTo]             = useState("");

  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length;
    return acc;
  }, {});
  const needsActionCount = NEEDS_ACTION_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.employee.name.toLowerCase().includes(q) ||
      r.employee.employeeCode.toLowerCase().includes(q) ||
      r.employee.employer.companyName.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "ALL"          ? true :
      statusFilter === "NEEDS_ACTION" ? NEEDS_ACTION_STATUSES.includes(r.status) :
      r.status === statusFilter;
    const created = r.createdAt ? new Date(r.createdAt) : null;
    const matchFrom = !dateFrom || (created !== null && created >= new Date(dateFrom));
    const matchTo   = !dateTo   || (created !== null && created <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pipeline = [
    { label: "Submitted",   key: "SUBMITTED" as const,           color: "bg-amber-400",   text: "text-amber-600"   },
    { label: "Emp Approved",key: "EMPLOYER_APPROVED" as const,   color: "bg-[#7679FF]",    text: "text-[#7679FF]"    },
    { label: "Ready",       key: "READY_FOR_DISBURSAL" as const, color: "bg-[#7679FF]",  text: "text-[#7679FF]"  },
    { label: "Disbursed",   key: "DISBURSED" as const,           color: "bg-[#7679FF]", text: "text-[#7679FF]" },
  ];

  const total = requests.length;

  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-[15px] font-[500] text-[#191A2E] leading-none">Salary Requests</h1>
        <p className="text-[11px] text-[#62657A] mt-1.5">Review and process employee salary advance requests</p>
      </div>

      {isError && (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load salary requests</p>
          <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
          <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
            Retry
          </button>
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
              className={`bg-white border rounded-lg p-3.5 text-left transition-colors ${statusFilter === key ? "border-[#E4E4EF]" : "border-[#E4E4EF] hover:border-[#E4E4EF]"}`}
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A] leading-none">{label}</p>
              <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${text} ${isLoading ? "opacity-20 animate-pulse" : ""}`}>{count}</p>
              <div className="h-[3px] rounded-full bg-[#F0F0F8] mt-2.5">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search employee, company…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-8 pl-8 pr-3 w-56 text-[12px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setStatusFilter("ALL"); setPage(1); }}
            className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === "ALL" ? CHIP_ON : CHIP_OFF}`}
          >
            All · {total}
          </button>
          {/* Needs Action quick-filter */}
          <button
            onClick={() => { setStatusFilter(statusFilter === "NEEDS_ACTION" ? "ALL" : "NEEDS_ACTION"); setPage(1); }}
            className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === "NEEDS_ACTION" ? CHIP_ACTION : CHIP_ACTION_OFF}`}
          >
            ⚡ Needs Action · {needsActionCount}
          </button>
          <div className="w-px h-4 bg-[#E4E4EF] mx-1" />
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? "ALL" : s); setPage(1); }}
              className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === s ? CHIP_ON : CHIP_OFF}`}
            >
              {STATUS_LABELS[s]} · {counts[s] ?? 0}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 ml-1">
          <Calendar size={12} className="text-[#62657A]" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="h-7 px-2 text-[11px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors text-[#62657A]"
          />
          <span className="text-[11px] text-[#62657A]">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="h-7 px-2 text-[11px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors text-[#62657A]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[#F0F0F8] text-[#62657A] hover:bg-[#E4E4EF] transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-[#62657A]">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        <button
          onClick={() => exportToCsv(filtered.map(r => ({
            RequestID:    r.id,
            Employee:     r.employee?.name ?? "",
            EmployeeCode: r.employee?.employeeCode ?? "",
            Company:      r.employee?.employer?.companyName ?? "",
            Requested:    r.amount,
            Approved:     r.approvedAmount ?? "",
            Status:       r.status,
            Date:         r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
          })), `salary-requests-${Date.now()}`)}
          className="h-8 px-3 flex items-center gap-1.5 text-[12px] font-[500] text-[#62657A] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F0F0F8] last:border-0">
              <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-32 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#F0F0F8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl py-14 text-center">
          <p className="text-[13px] font-[500] text-[#62657A]">No requests found</p>
          <p className="text-[11px] text-[#62657A] mt-1">
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filter." : "No salary requests submitted yet."}
          </p>
        </div>
      ) : (
        <>
          <SalaryRequestsTable
            requests={paginated}
            selectedId={selected?.id ?? null}
            onSelect={(r) => setSelected(selected?.id === r.id ? null : r)}
          />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPage={setPage}
          />
        </>
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
