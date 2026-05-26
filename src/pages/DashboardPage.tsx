import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Loader2,
  ReceiptIndianRupee,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export function DashboardPage() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [disbursals, setDisbursals] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function unwrap(response: any) {
    return (
      response.data?.data?.data ||
      response.data?.data?.items ||
      response.data?.data ||
      response.data ||
      []
    );
  }

  async function fetchDashboard() {
    setLoading(true);

    try {
      const [
        employersRes,
        employeesRes,
        requestsRes,
        disbursalsRes,
        repaymentsRes,
        enquiriesRes,
      ] = await Promise.all([
        api.get("/employers"),
        api.get("/employees"),
        api.get("/advance-requests"),
        api.get("/disbursals"),
        api.get("/repayments"),
        api.get("/enquiries"),
      ]);

      setEmployers(
        Array.isArray(unwrap(employersRes)) ? unwrap(employersRes) : []
      );
      setEmployees(
        Array.isArray(unwrap(employeesRes)) ? unwrap(employeesRes) : []
      );
      setRequests(
        Array.isArray(unwrap(requestsRes)) ? unwrap(requestsRes) : []
      );
      setDisbursals(
        Array.isArray(unwrap(disbursalsRes)) ? unwrap(disbursalsRes) : []
      );
      setRepayments(
        Array.isArray(unwrap(repaymentsRes)) ? unwrap(repaymentsRes) : []
      );
      setEnquiries(
        Array.isArray(unwrap(enquiriesRes)) ? unwrap(enquiriesRes) : []
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Employers",
        value: employers.length,
        change: "Approved employers",
        icon: Building2,
        to: "/employers",
      },
      {
        label: "Total Employees",
        value: employees.length,
        change: "All registered employees",
        icon: Users,
        to: "/employees",
      },
      {
        label: "Pending Requests",
        value: requests.filter((item) => item.status === "PENDING").length,
        change: "Needs review",
        icon: ClipboardList,
        to: "/requests",
      },
      {
        label: "Pending Disbursals",
        value: disbursals.filter((item) => item.status === "PENDING").length,
        change: "Ready to process",
        icon: CreditCard,
        to: "/requests",
      },
      {
        label: "Overdue Repayments",
        value: repayments.filter((item) => item.status === "OVERDUE").length,
        change: "Needs follow-up",
        icon: ReceiptIndianRupee,
        to: "/repayments",
      },
      {
        label: "New Enquiries",
        value: enquiries.filter((item) => item.status === "NEW").length,
        change: "Not contacted yet",
        icon: HelpCircle,
        to: "/enquiries",
      },
    ],
    [employers, employees, requests, disbursals, repayments, enquiries]
  );

  const recentRequests = requests.slice(0, 4);
  const recentRepayments = repayments.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
        <Loader2 className="animate-spin text-primary" size={18} />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-soft md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-200">Overview</p>
            <h2 className="mt-2 text-3xl font-bold">Admin Dashboard</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Track employers, employees, advance requests, disbursals,
              repayments, and enquiries from one place.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              to={item.to}
              key={item.label}
              className="rounded-[1.5rem] bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
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
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardList
          title="Recent Requests"
          description="Latest advance salary requests."
          empty="No requests found."
          items={recentRequests.map((item) => ({
            id: item.id,
            title: item.employee?.name || "Unknown employee",
            subtitle: item.employer?.companyName || "Unknown employer",
            meta: item.status,
            to: `/requests/${item.id}`,
          }))}
        />

        <DashboardList
          title="Recent Repayments"
          description="Latest repayment records."
          empty="No repayments found."
          items={recentRepayments.map((item) => ({
            id: item.id,
            title: item.advanceRequest?.employee?.name || "Unknown employee",
            subtitle:
              item.advanceRequest?.employer?.companyName || "Unknown employer",
            meta: item.status,
            to: `/repayments/${item.id}`,
          }))}
        />
      </section>
    </div>
  );
}

function DashboardList({
  title,
  description,
  empty,
  items,
}: {
  title: string;
  description: string;
  empty: string;
  items: {
    id: string;
    title: string;
    subtitle: string;
    meta: string;
    to: string;
  }[];
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-6 grid gap-3">
        {items.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            {empty}
          </div>
        )}

        {items.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-primary hover:bg-white"
          >
            <div>
              <p className="font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {item.meta}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
