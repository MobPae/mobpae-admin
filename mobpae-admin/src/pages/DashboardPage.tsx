import SystemOverview from "../components/dashboard/SystemOverview";
import PendingActions from "../components/dashboard/PendingActions";
import FinancialOverview from "../components/dashboard/FinancialOverview";
import RecentActivity from "../components/dashboard/RecentActivity";
import RecentSalaryRequests from "../components/dashboard/RecentSalaryRequests";

export default function DashboardPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Admin 👋
        </h1>

        <p className="text-[12px] text-slate-500 mt-2">
          Here's what's happening with your platform today.
        </p>
      </div>

      <SystemOverview />

      <div className="grid grid-cols-12 gap-5 mt-5 items-start">
        <PendingActions />
        <FinancialOverview />
      </div>

      <div className="grid grid-cols-12 gap-5 mt-5 items-start">
        <RecentActivity />
        <RecentSalaryRequests />
      </div>
    </div>
  );
}
