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
  pendingEmployers: 0,
  totalEmployees: 0,
  activeEmployees: 0,
  pendingKycDocuments: 0,
  pendingBankAccounts: 0,
  pendingSalaryRequests: 0,
  pendingDisbursals: 0,
  disbursedAmount: 0,
  recoveredAmount: 0,
  outstandingAmount: 0,
  pendingSettlements: 0,
  membershipRevenue: 0,
  activeMemberships: 0,
  activeRepayments: 0,
};

const EMPTY_REQUESTS: SalaryRequest[] = [];

function statusBadge(status: SalaryRequest["status"]): string {
  switch (status) {
    case "SUBMITTED":           return "bg-amber-50 text-amber-700";
    case "EMPLOYER_APPROVED":   return "bg-[#E7F1FC] text-[#185FA5]";
    case "READY_FOR_DISBURSAL": return "bg-lime-50 text-lime-700";
    case "DISBURSED":           return "bg-[#EBF6E3] text-[#3B6D11]";
    case "EMPLOYER_REJECTED":   return "bg-red-50 text-red-600";
    case "REPAYMENT_SCHEDULED": return "bg-[#FEF1E7] text-[#9A4910]";
    case "REPAID":              return "bg-[#D4EDE5] text-[#1A5944]";
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

  const fmt = (n: number) =>
    n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000  ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000     ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toLocaleString("en-IN")}`;

  const kpis = [
    { label: "Active employers",   value: d.activeEmployers,                           sub: `${d.totalEmployers} total`,     accent: false },
    { label: "Active employees",   value: d.activeEmployees.toLocaleString("en-IN"),   sub: `${d.totalEmployees} total`,     accent: false },
    { label: "Pending requests",   value: d.pendingSalaryRequests,                     sub: "awaiting review",               accent: d.pendingSalaryRequests > 0 },
    { label: "Pending disbursals", value: d.pendingDisbursals,                         sub: "ready to process",              accent: d.pendingDisbursals > 0 },
    { label: "KYC pending",        value: d.pendingKycDocuments,                       sub: "docs in queue",                 accent: d.pendingKycDocuments > 0 },
    { label: "Bank pending",       value: d.pendingBankAccounts,                       sub: "awaiting verify",               accent: d.pendingBankAccounts > 0 },
  ];

  const financialKpis = [
    { label: "Disbursed",          value: fmt(d.disbursedAmount),   sub: "total disbursed",       accent: false },
    { label: "Outstanding",        value: fmt(d.outstandingAmount), sub: "to be recovered",        accent: d.outstandingAmount > 0 },
    { label: "Recovered",          value: fmt(d.recoveredAmount),   sub: "repayments collected",   accent: false },
    { label: "Settlements",        value: d.pendingSettlements,     sub: "pending",                accent: d.pendingSettlements > 0 },
    { label: "Membership rev.",    value: fmt(d.membershipRevenue), sub: "from memberships",       accent: false },
    { label: "Active memberships", value: d.activeMemberships,      sub: "subscribed",             accent: false },
  ];

  const actionItems = [
    { label: "Salary requests", sub: "Awaiting review", count: d.pendingSalaryRequests, color: "bg-amber-400", to: "/salary-requests" },
    { label: "KYC documents", sub: "Pending verification", count: d.pendingKycDocuments, color: "bg-[#7679FF]", to: "/kyc" },
    { label: "Disbursals", sub: "Ready to process", count: d.pendingDisbursals, color: "bg-[#7679FF]", to: "/disbursals" },
    { label: "Active recoveries", sub: "In progress", count: d.activeRepayments, color: "bg-[#B7B9C7]", to: "/recoveries" },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-[500] text-[#191A2E] leading-none">Dashboard</h1>
          <p className="text-[11px] text-[#62657A] mt-1.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md border ${health?.status === "ok" ? "bg-[#ECEBFF] border-[#ECEBFF]" : health === undefined ? "bg-[#F7F7FB] border-[#E4E4EF]" : "bg-red-50 border-red-100"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${health?.status === "ok" ? "bg-[#ECEBFF]0" : health === undefined ? "bg-[#D4D5E0]" : "bg-red-500"}`} />
          <span className={`text-[11px] font-[500] ${health?.status === "ok" ? "text-[#5659D9]" : health === undefined ? "text-[#62657A]" : "text-red-700"}`}>{health?.status === "ok" ? "Live" : health === undefined ? "Checking…" : "Degraded"}</span>
        </div>
      </div>

      {/* KPI Strip — operational */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E4E4EF] rounded-lg p-3.5">
            <p className="text-[11px] text-[#62657A] uppercase tracking-[0.06em] font-[500] leading-none">
              {kpi.label}
            </p>
            <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${
              kpi.accent ? "text-amber-600" : "text-[#191A2E]"
            } ${dashLoading ? "opacity-20 animate-pulse" : ""}`}>
              {kpi.value}
            </p>
            <p className="text-[11px] text-[#62657A] mt-1.5 leading-none">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* KPI Strip — financial */}
      <div className="grid grid-cols-6 gap-3">
        {financialKpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E4E4EF] rounded-lg p-3.5">
            <p className="text-[11px] text-[#62657A] uppercase tracking-[0.06em] font-[500] leading-none">
              {kpi.label}
            </p>
            <p className={`text-[18px] font-[500] tracking-tight leading-none mt-2.5 ${
              kpi.accent ? "text-amber-600" : "text-[#191A2E]"
            } ${dashLoading ? "opacity-20 animate-pulse" : ""}`}>
              {kpi.value}
            </p>
            <p className="text-[11px] text-[#62657A] mt-1.5 leading-none">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_264px] gap-4">
        {/* Recent salary requests */}
        <div className="bg-white border border-[#E4E4EF] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4EF]">
            <span className="text-[12px] font-[500] text-[#191A2E]">Recent salary requests</span>
            <button
              onClick={() => void navigate("/salary-requests")}
              className="text-[11px] text-[#62657A] hover:text-[#62657A] transition-colors"
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
              <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]">
                {["Employee", "Company", "Amount", "Status", "When"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[11px] font-[600] uppercase tracking-[0.08em] text-[#62657A]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {srLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#F0F0F8]">
                    <td className="px-4 py-3"><div className="h-2.5 w-24 bg-[#F0F0F8] rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-20 bg-[#F0F0F8] rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-14 bg-[#F0F0F8] rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-2.5 w-10 bg-[#F0F0F8] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-[#62657A]">No salary requests yet</td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-[#F0F0F8] last:border-0 hover:bg-[#F7F7FB]/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#191A2E] to-[#2A2C45] text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0">
                          {req.employee.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[12px] font-[500] text-[#191A2E] truncate">{req.employee.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-[#62657A] truncate">{req.employee.employer.companyName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-[600] text-[#191A2E] tabular-nums">{formatAmount(req.amount)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-[20px] px-2.5 rounded-full items-center text-[11px] font-[500] ${statusBadge(req.status)}`}>
                        {statusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-[#62657A]">{timeAgo(req.requestedAt)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* Right: Action queue */}
        <div className="bg-white border border-[#E4E4EF] rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#E4E4EF] flex-shrink-0">
            <span className="text-[12px] font-[500] text-[#191A2E]">Action queue</span>
          </div>

          <div className="flex-1">
            {actionItems.map((item) => (
              <button
                key={item.label}
                onClick={() => void navigate(item.to)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F8] last:border-0 hover:bg-[#F7F7FB]/60 transition-colors text-left"
              >
                <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-[500] text-[#191A2E] leading-none">{item.label}</p>
                  <p className="text-[11px] text-[#62657A] mt-1 leading-none">{item.sub}</p>
                </div>
                <span className={`text-[11px] font-[500] px-2 py-0.5 rounded-full ${
                  item.count > 0 ? "bg-amber-50 text-amber-700" : "bg-[#F0F0F8] text-[#62657A]"
                }`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Employer mini breakdown */}
          <div className="border-t border-[#E4E4EF] px-4 py-3 flex-shrink-0">
            <p className="text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A] mb-2.5">
              Employers
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Active", value: d.activeEmployers, color: "text-[#7679FF]" },
                { label: "Total", value: d.totalEmployers, color: "text-[#191A2E]" },
                { label: "Pending", value: d.pendingEmployers, color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="bg-[#F7F7FB] rounded-md p-2 text-center">
                  <p className={`text-[15px] font-[500] leading-none ${s.color} ${dashLoading ? "animate-pulse opacity-20" : ""}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-[#62657A] mt-1 leading-none">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
