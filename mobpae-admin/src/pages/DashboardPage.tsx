import { useQuery } from "@tanstack/react-query";
import { Building2, Users, FileText, ArrowDownCircle } from "lucide-react";
import { getAdminDashboard } from "../services/dashboardService";
import StatCard from "../components/dashboard/StatCard";
import ActionQueue from "../components/dashboard/ActionQueue";
import type { AdminDashboard } from "../types/dashboard";

const EMPTY: AdminDashboard = {
  totalEmployers: 0,
  activeEmployers: 0,
  totalEmployees: 0,
  pendingKycDocuments: 0,
  pendingSalaryRequests: 0,
  pendingDisbursals: 0,
  activeRepayments: 0,
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
  });

  const d = data ?? EMPTY;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-[700] tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          Could not load dashboard data. Check that the backend is running.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Employers"
          value={d.activeEmployers}
          sublabel={`${d.totalEmployers} total registered`}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          loading={isLoading}
        />
        <StatCard
          label="Total Employees"
          value={d.totalEmployees.toLocaleString("en-IN")}
          icon={Users}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          loading={isLoading}
        />
        <StatCard
          label="Pending Requests"
          value={d.pendingSalaryRequests}
          sublabel="Awaiting approval"
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={isLoading}
        />
        <StatCard
          label="Pending Disbursals"
          value={d.pendingDisbursals}
          sublabel="Ready to process"
          icon={ArrowDownCircle}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          loading={isLoading}
        />
      </div>

      {/* Action Queue */}
      <ActionQueue data={d} loading={isLoading} />
    </div>
  );
}
