import {
  Building2,
  ClipboardList,
  CreditCard,
  HelpCircle,
  ReceiptIndianRupee,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Total Employers",
    value: "12",
    change: "+2 this month",
    icon: Building2,
  },
  {
    label: "Total Employees",
    value: "1,248",
    change: "+86 this month",
    icon: Users,
  },
  {
    label: "Pending Requests",
    value: "18",
    change: "Needs review",
    icon: ClipboardList,
  },
  {
    label: "Pending Disbursals",
    value: "7",
    change: "Ready to process",
    icon: CreditCard,
  },
  {
    label: "Pending Repayments",
    value: "24",
    change: "Due soon",
    icon: ReceiptIndianRupee,
  },
  {
    label: "New Enquiries",
    value: "9",
    change: "Last 7 days",
    icon: HelpCircle,
  },
];

const recentActivities = [
  "New employer enquiry received from ABC Technologies",
  "Salary advance request approved for employee EMP-1024",
  "Disbursal pending for request REQ-2301",
  "Repayment marked completed for employee EMP-1008",
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-soft md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-200">Overview</p>
            <h2 className="mt-2 text-3xl font-bold">Admin Dashboard</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Track employers, employees, salary advance requests, disbursals,
              repayments, and enquiries from one place.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-200" size={28} />
              <div>
                <p className="text-sm text-slate-300">Platform Status</p>
                <p className="font-bold">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-[1.5rem] bg-white p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold">{item.value}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.change}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-soft xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <p className="mt-1 text-sm text-slate-500">
                Latest platform updates and actions.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {recentActivities.map((activity) => (
              <div
                key={activity}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700"
              >
                {activity}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-slate-500">Common admin tasks.</p>

          <div className="mt-6 grid gap-3">
            {[
              "Review pending requests",
              "Check disbursals",
              "View new enquiries",
              "Manage employees",
            ].map((action) => (
              <button
                key={action}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
