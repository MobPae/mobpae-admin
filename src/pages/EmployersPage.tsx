import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type EmployerStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "DISCONTINUED";

type Employer = {
  id: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  status?: EmployerStatus;
  appActivationRequired?: boolean;
  employees?: unknown[];
  createdAt?: string;
};

const STATUS_OPTIONS: EmployerStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "PAUSED",
  "DISCONTINUED",
];

export function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function fetchEmployers() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/employers");

      const data =
        response.data?.data?.data ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setEmployers(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load employers");
    } finally {
      setLoading(false);
    }
  }

  async function updateEmployerStatus(id: string, status: EmployerStatus) {
    const confirmUpdate = window.confirm(
      `Change employer status to ${status}?`
    );

    if (!confirmUpdate) return;

    setUpdatingId(id);

    try {
      await api.patch(`/employers/${id}/status`, { status });

      setEmployers((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch {
      alert("Unable to update employer status");
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter((item) => {
    const value =
      `${item.companyName} ${item.companyEmail} ${item.companyPhone} ${item.status}`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  function getStatusClass(status?: EmployerStatus) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "INACTIVE":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "PAUSED":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "DISCONTINUED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Employers</p>
          <h2 className="mt-2 text-2xl font-bold">Employer Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage approved employers and control their service status.
          </p>
        </div>

        <button
          onClick={fetchEmployers}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-soft">
        <div className="relative">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company, email, phone or status..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </section>

      {loading && (
        <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
          Loading employers...
        </div>
      )}

      {error && (
        <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Contact Details</th>
                  <th className="px-5 py-4">Employees Added</th>
                  <th className="px-5 py-4">App Activation</th>
                  <th className="px-5 py-4">Service Status</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmployers.map((item) => {
                  const status = item.status || "ACTIVE";
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                            <Building2 size={18} />
                          </span>

                          <Link
                            to={`/employers/${item.id}`}
                            className="font-semibold text-slate-800 hover:text-primary"
                          >
                            {item.companyName || "-"}
                          </Link>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="grid gap-1 text-slate-600">
                          {item.companyEmail && (
                            <span className="inline-flex items-center gap-2">
                              <Mail size={14} /> {item.companyEmail}
                            </span>
                          )}

                          {item.companyPhone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone size={14} /> {item.companyPhone}
                            </span>
                          )}

                          {!item.companyEmail && !item.companyPhone && "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.employees?.length || 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.appActivationRequired
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.appActivationRequired
                            ? "Required"
                            : "Not Required"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={status}
                            disabled={isUpdating}
                            onChange={(event) =>
                              updateEmployerStatus(
                                item.id,
                                event.target.value as EmployerStatus
                              )
                            }
                            className={`rounded-full border px-3 py-1 text-xs font-bold outline-none disabled:cursor-not-allowed disabled:opacity-70 ${getStatusClass(
                              status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <Loader2
                              className="animate-spin text-primary"
                              size={16}
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No employers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
