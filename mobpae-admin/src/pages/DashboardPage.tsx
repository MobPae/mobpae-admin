import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../services/dashboardService";
import { getHealth } from "../services/healthService";
import { getSalaryRequests } from "../services/salaryRequestService";
import type { AdminDashboard } from "../types/dashboard";
import type { SalaryRequest } from "../types/salary-request";

const EMPTY_DASHBOARD: AdminDashboard = {
  totalEmployers: 0,
  activeEmployers: 0,
  totalEmployees: 0,
  pendingKycDocuments: 0,
  pendingSalaryRequests: 0,
  pendingDisbursals: 0,
  activeRepayments: 0,
};

const EMPTY_REQUESTS: SalaryRequest[] = [];

function statusBadge(status: SalaryRequest["status"]): string {
  switch (status) {
    case "SUBMITTED": return "bg-amber-50 text-amber-700";
    case "EMPLOYER_APPROVED": return "bg-blue-50 text-blue-700";
    case "READY_FOR_DISBURSAL": return "bg-blue-50 text-blue-700";
    case "DISBURSED": return "bg-green-50 text-green-700";
    case "EMPLOYER_REJECTED": return "bg-red-50 text-red-600";
    case "REPAYMENT_SCHEDULED": return "bg-blue-50 text-blue-700";
    case "REPAID": return "bg-slate-100 text-slate-500";
  }
}

function statusLabel(status: SalaryRequest["status"]): string {
  switch (status) {
    case "SUBMITTED": return "Submitted";
    case "EMPLOYER_APPROVED": return "Approved";
    case "READY_FOR_DISBURSAL": return "Ready";
    case "DISBURSED": return "Disbursed";
    case "EMPLOYER_REJECTED": return "Rejected";
    case "REPAYMENT_SCHEDULED": return "Recovery";
    case "REPAID": return "Repaid";
  }
}

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  return isNaN(n) ? raw : `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
  });

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
    refetchInterval: 60_000,
  });

  const { data: salaryRequests, isLoading: srLoading } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  const d = dashboard ?? EMPTY_DASHBOARD;
  const recentRequests = (salaryRequests ?? EMPTY_REQUESTS)
    .slice()
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5);

  const kpis = [
    { label: "Active employers", value: d.activeEmployers, sub: `${d.totalEmployers} total`, accent: false },
    { label: "Total employees", value: d.totalEmployees.toLocaleString("en-IN"), sub: "across all orgs", accent: false },
    { label: "Pending requests", value: d.pendingSalaryRequests, sub: "awaiting review", accent: d.pendingSalaryRequests > 0 },
    { label: "Pending disbursals", value: d.pendingDisbursals, sub: "ready to process", accent: d.pendingDisbursals > 0 },
    { label: "KYC pending", value: d.pendingKycDocuments, sub: "docs in queue", accent: d.pendingKycDocuments > 0 },
    { label: "Active recoveries", value: d.activeRepayments, sub: "in progress", accent: false },
  ];

  const actionItems = [
    { label: "Salary requests", sub: "Awaiting review", count: d.pendingSalaryRequests, color: "bg-amber-400", to: "/salary-requests" },
    { label: "KYC documents", sub: "Pending verification", count: d.pendingKycDocuments, color: "bg-blue-400", to: "/kyc" },
    { label: "Disbursals", sub: "Ready to process", count: d.pendingDisbursals, color: "bg-blue-400", to: "/disbursals" },
    { label: "Active recoveries", sub: "In progress", count: d.activeRepayments, color: "bg-slate-400", to: "/recoveries" },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-[500] text-slate-900 leading-none">Dashboard</h1>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md border ${health?.status === "ok" ? "bg-green-50 border-green-100" : health === undefined ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-100"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${health?.status === "ok" ? "bg-green-500" : health === undefined ? "bg-slate-300" : "bg-red-500"}`} />
          <span className={`text-[11px] font-[500] ${health?.status === "ok" ? "text-green-700" : health === undefined ? "text-slate-500" : "text-red-700"}`}>{health?.status === "ok" ? "Live" : health === undefined ? "Checking…" : "Degraded"}</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-100 rounded-lg p-3.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.06em] font-[500] leading-none">
              {kpi.label}
            </p>
            <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${
              kpi.accent ? "text-amber-600" : "text-slate-900"
            } ${dashLoading ? "opacity-20 animate-pulse" : ""}`}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-none">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_264px] gap-4">
        {/* Recent salary requests */}
        <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[12px] font-[500] text-slate-800">Recent salary requests</span>
            <button
              onClick={() => void navigate("/salary-requests")}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              View all →
            </button>
          </div>



          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Employee", "Company", "Amount", "Status", "When"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-[600] uppercase tracking-[0.08em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {srLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-4 py-3"><div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-14 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-10 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-slate-400">No salary requests yet</td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center text-[10px] font-[700] flex-shrink-0">
                          {req.employee.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[12px] font-[500] text-slate-800 truncate">{req.employee.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-slate-500 truncate">{req.employee.employer.companyName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-[600] text-slate-900 tabular-nums">{formatAmount(req.amount)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-[20px] px-2.5 rounded-full items-center text-[10px] font-[500] ${statusBadge(req.status)}`}>
                        {statusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-slate-400">{timeAgo(req.requestedAt)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* Right: Action queue */}
        <div className="bg-white border border-slate-100 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
            <span className="text-[12px] font-[500] text-slate-800">Action queue</span>
          </div>

          <div className="flex-1">
            {actionItems.map((item) => (
              <button
                key={item.label}
                onClick={() => void navigate(item.to)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors text-left"
              >
                <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-[500] text-slate-800 leading-none">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-none">{item.sub}</p>
                </div>
                <span className={`text-[11px] font-[500] px-2 py-0.5 rounded-full ${
                  item.count > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Employer mini breakdown */}
          <div className="border-t border-slate-100 px-4 py-3 flex-shrink-0">
            <p className="text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400 mb-2.5">
              Employers
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Active", value: d.activeEmployers, color: "text-green-600" },
                { label: "Total", value: d.totalEmployers, color: "text-slate-800" },
                { label: "Pending", value: Math.max(0, d.totalEmployers - d.activeEmployers), color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-md p-2 text-center">
                  <p className={`text-[15px] font-[500] leading-none ${s.color} ${dashLoading ? "animate-pulse opacity-20" : ""}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
