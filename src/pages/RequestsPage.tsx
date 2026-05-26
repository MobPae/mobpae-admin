import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCcw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { api } from "../services/api";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";
type RepaymentStatus = "PENDING" | "PAID" | "OVERDUE";

type AdvanceRequest = {
  id: string;
  amount: number;
  requestMonth: number;
  requestYear: number;
  status: RequestStatus;
  employerRemarks?: string | null;
  createdAt?: string;
  employer?: {
    id: string;
    companyName: string;
    companyEmail?: string;
  };
  employee?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    salaryInHand?: number;
    availableLimit?: number;
  };
  disbursal?: {
    id: string;
    status: DisbursalStatus;
    amount: number;
    transactionRef?: string | null;
    adminRemarks?: string | null;
    disbursedAt?: string | null;
  } | null;
  repayment?: {
    id: string;
    status: RepaymentStatus;
    amount: number;
    dueDate?: string;
    paidAt?: string | null;
    paymentRef?: string | null;
  } | null;
};

export function RequestsPage() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RequestStatus>(
    "ALL"
  );
  const [error, setError] = useState("");

  async function fetchRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/advance-requests");

      const data =
        response.data?.data?.data ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load advance requests");
    } finally {
      setLoading(false);
    }
  }

  async function updateRequestStatus(
    request: AdvanceRequest,
    status: "APPROVED" | "REJECTED"
  ) {
    const remarks =
      status === "REJECTED"
        ? window.prompt("Enter rejection remarks") || ""
        : window.prompt("Enter approval remarks (optional)") || "";

    if (status === "REJECTED" && !remarks.trim()) {
      alert("Rejection remarks are required");
      return;
    }

    const confirmUpdate = window.confirm(
      `${status === "APPROVED" ? "Approve" : "Reject"} this request?`
    );

    if (!confirmUpdate) return;

    setUpdatingId(request.id);

    try {
      await api.patch(`/advance-requests/${request.id}/status`, {
        status,
        employerRemarks: remarks,
      });

      await fetchRequests();
    } catch {
      alert(`Unable to ${status.toLowerCase()} request`);
    } finally {
      setUpdatingId("");
    }
  }

  async function updateDisbursalStatus(
    request: AdvanceRequest,
    status: "DISBURSED" | "FAILED"
  ) {
    if (!request.disbursal?.id) {
      alert("Disbursal is not created yet. Approve the request first.");
      return;
    }

    const transactionRef =
      status === "DISBURSED"
        ? window.prompt("Enter transaction reference") || ""
        : "";

    if (status === "DISBURSED" && !transactionRef.trim()) {
      alert("Transaction reference is required");
      return;
    }

    const adminRemarks = window.prompt("Enter admin remarks (optional)") || "";

    const confirmUpdate = window.confirm(`Mark disbursal as ${status}?`);

    if (!confirmUpdate) return;

    setUpdatingId(request.id);

    try {
      await api.patch(`/disbursals/${request.disbursal.id}/status`, {
        status,
        transactionRef,
        adminRemarks,
      });

      await fetchRequests();
    } catch {
      alert(`Unable to mark disbursal as ${status.toLowerCase()}`);
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const value =
        `${request.employee?.name} ${request.employee?.email} ${request.employer?.companyName} ${request.status} ${request.disbursal?.status} ${request.repayment?.status}`.toLowerCase();

      const matchesSearch = value.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING").length,
      approved: requests.filter((item) => item.status === "APPROVED").length,
      disbursed: requests.filter(
        (item) => item.disbursal?.status === "DISBURSED"
      ).length,
    };
  }, [requests]);

  function formatAmount(value?: number) {
    if (!value) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getRequestStatusClass(status?: RequestStatus) {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  function getDisbursalStatusClass(status?: DisbursalStatus) {
    switch (status) {
      case "DISBURSED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-100";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  function getRepaymentStatusClass(status?: RepaymentStatus) {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "OVERDUE":
        return "bg-red-50 text-red-700 border-red-100";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Requests</p>
          <h2 className="mt-2 text-2xl font-bold">
            Advance Request Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review salary advance requests, approve or reject them, and mark
            payment disbursal status.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Requests" value={summary.total} />
        <SummaryCard label="Pending Review" value={summary.pending} />
        <SummaryCard label="Approved" value={summary.approved} />
        <SummaryCard label="Disbursed" value={summary.disbursed} />
      </section>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, employer, status..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | RequestStatus)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </section>

      {loading && (
        <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
          Loading advance requests...
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
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Employer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Month</th>
                  <th className="px-5 py-4">Request Status</th>
                  <th className="px-5 py-4">Disbursal</th>
                  <th className="px-5 py-4">Repayment</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => {
                  const isUpdating = updatingId === request.id;

                  return (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                            <User size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {request.employee?.name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {request.employee?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <Building2 size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {request.employer?.companyName || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {request.employer?.companyEmail || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900">
                          <IndianRupee size={15} />
                          {formatAmount(request.amount).replace("₹", "")}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {request.requestMonth}/{request.requestYear}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getRequestStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getDisbursalStatusClass(
                            request.disbursal?.status
                          )}`}
                        >
                          {request.disbursal?.status || "NOT CREATED"}
                        </span>

                        {request.disbursal?.transactionRef && (
                          <p className="mt-1 text-xs text-slate-500">
                            Ref: {request.disbursal.transactionRef}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getRepaymentStatusClass(
                            request.repayment?.status
                          )}`}
                        >
                          {request.repayment?.status || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isUpdating ? (
                          <Loader2
                            className="animate-spin text-primary"
                            size={18}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {request.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateRequestStatus(request, "APPROVED")
                                  }
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  <CheckCircle2 size={14} />
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    updateRequestStatus(request, "REJECTED")
                                  }
                                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </>
                            )}

                            {request.status === "APPROVED" &&
                              request.disbursal?.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateDisbursalStatus(
                                        request,
                                        "DISBURSED"
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                                  >
                                    Mark Disbursed
                                  </button>

                                  <button
                                    onClick={() =>
                                      updateDisbursalStatus(request, "FAILED")
                                    }
                                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                                  >
                                    Failed
                                  </button>
                                </>
                              )}

                            {request.status !== "PENDING" &&
                              request.disbursal?.status !== "PENDING" && (
                                <span className="text-xs font-semibold text-slate-400">
                                  No action
                                </span>
                              )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No advance requests found.
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}
