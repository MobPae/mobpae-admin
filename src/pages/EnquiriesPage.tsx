import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Search,
} from "lucide-react";
import { api } from "../services/api";

type EnquiryStatus = "NEW" | "CONTACTED" | "VERIFIED" | "APPROVED" | "REJECTED";

type Enquiry = {
  id: string;
  contactName: string;
  companyName?: string;
  email: string;
  phone?: string;
  employeeCount?: number;
  message?: string;
  status?: EnquiryStatus;
  createdAt?: string;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS: Exclude<EnquiryStatus, "APPROVED">[] = [
  "NEW",
  "CONTACTED",
  "VERIFIED",
  "REJECTED",
];

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function fetchEnquiries() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/enquiries");

      const data =
        response.data?.data?.data ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load enquiries");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    id: string,
    status: Exclude<EnquiryStatus, "APPROVED">
  ) {
    setUpdatingId(id);

    try {
      await api.patch(`/enquiries/${id}/status`, { status });

      setEnquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch {
      alert("Unable to update status");
    } finally {
      setUpdatingId("");
    }
  }

  async function approveEnquiry(id: string) {
    const confirmApprove = window.confirm(
      "Approve this enquiry and create employer?"
    );

    if (!confirmApprove) return;

    setApprovingId(id);

    try {
      await api.post(`/employers/from-enquiry/${id}`);

      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "APPROVED" } : item
        )
      );

      alert("Employer created successfully");
    } catch {
      alert(
        "Unable to approve enquiry. Make sure status is VERIFIED and employer does not already exist."
      );
    } finally {
      setApprovingId("");
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredEnquiries = enquiries.filter((item) => {
    const value =
      `${item.contactName} ${item.companyName} ${item.email} ${item.phone}`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnquiries.length / PAGE_SIZE)
  );
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedEnquiries = filteredEnquiries.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  function goPrevious() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goNext() {
    setPage((current) => Math.min(totalPages, current + 1));
  }

  function getStatusClass(status?: EnquiryStatus) {
    switch (status) {
      case "NEW":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "CONTACTED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "VERIFIED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "APPROVED":
        return "bg-violet-50 text-violet-700 border-violet-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Enquiries</p>
          <h2 className="mt-2 text-2xl font-bold">Website Enquiries</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track enquiries, verify companies, and approve them as employers.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
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
            placeholder="Search by contact, company, email or phone..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </section>

      {loading && (
        <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
          Loading enquiries...
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
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Employee Count</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedEnquiries.map((item) => {
                  const status = item.status || "NEW";
                  const isUpdating = updatingId === item.id;
                  const isApproving = approvingId === item.id;
                  const canApprove = status === "VERIFIED";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {item.contactName}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.companyName || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.employeeCount || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="grid gap-1 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Mail size={14} /> {item.email}
                          </span>
                          {item.phone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone size={14} /> {item.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {item.message || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {status === "APPROVED" ? (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                status
                              )}`}
                            >
                              <CheckCircle2 size={14} />
                              APPROVED
                            </span>
                          ) : (
                            <select
                              value={status}
                              disabled={isUpdating}
                              onChange={(event) =>
                                updateStatus(
                                  item.id,
                                  event.target.value as Exclude<
                                    EnquiryStatus,
                                    "APPROVED"
                                  >
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
                          )}

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

                      <td className="px-5 py-4">
                        {status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Employer Created
                          </span>
                        ) : (
                          <button
                            onClick={() => approveEnquiry(item.id)}
                            disabled={!canApprove || isApproving}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {isApproving ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Building2 size={14} />
                            )}
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {paginatedEnquiries.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {filteredEnquiries.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + PAGE_SIZE, filteredEnquiries.length)} of{" "}
              {filteredEnquiries.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={goPrevious}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={goNext}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
