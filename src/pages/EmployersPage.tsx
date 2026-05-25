import { useEffect, useState } from "react";
import { Building2, Mail, Phone, RefreshCcw, Search } from "lucide-react";
import { api } from "../services/api";

type Employer = {
  id: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  status?: string;
  appActivationRequired?: boolean;
  employees?: unknown[];
  createdAt?: string;
};

export function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter((item) => {
    const value =
      `${item.companyName} ${item.companyEmail} ${item.companyPhone}`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Employers</p>
          <h2 className="mt-2 text-2xl font-bold">Employer Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            View companies onboarded or created in MobPae.
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
            placeholder="Search by company, email or phone..."
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Contact Details</th>
                  <th className="px-5 py-4">Employees Added</th>
                  <th className="px-5 py-4">App Activation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmployers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                          <Building2 size={18} />
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.companyName || "-"}
                        </span>
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
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">
                        {item.status || "ACTIVE"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}

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
