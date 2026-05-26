import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCcw,
  Search,
  User,
  X,
} from "lucide-react";
import { api } from "../services/api";

type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";

type Disbursal = {
  id: string;
  status: DisbursalStatus;
  amount: number;
  transactionRef?: string | null;
  adminRemarks?: string | null;
  disbursedAt?: string | null;
  advanceRequest?: {
    id: string;
    amount: number;
    status: string;
    employee?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    employer?: {
      id: string;
      companyName: string;
      companyEmail?: string;
    };
    repayment?: {
      id: string;
      status: string;
      amount: number;
      dueDate?: string;
    } | null;
  };
};

type ModalAction = "MARK_DISBURSED" | "MARK_FAILED";

type ActionModalState = {
  open: boolean;
  action: ModalAction | null;
  disbursal: Disbursal | null;
};

export function DisbursalsPage() {
  const [disbursals, setDisbursals] = useState<Disbursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DisbursalStatus>(
    "ALL"
  );
  const [error, setError] = useState("");

  const [modal, setModal] = useState<ActionModalState>({
    open: false,
    action: null,
    disbursal: null,
  });

  const [transactionRef, setTransactionRef] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");

  async function fetchDisbursals() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/disbursals");

      const data =
        response.data?.data?.data ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setDisbursals(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load disbursals");
    } finally {
      setLoading(false);
    }
  }

  function openActionModal(action: ModalAction, disbursal: Disbursal) {
    setModal({
      open: true,
      action,
      disbursal,
    });
    setTransactionRef("");
    setAdminRemarks("");
  }

  function closeActionModal() {
    if (updatingId) return;

    setModal({
      open: false,
      action: null,
      disbursal: null,
    });
    setTransactionRef("");
    setAdminRemarks("");
  }

  async function submitAction() {
    if (!modal.disbursal || !modal.action) return;

    if (modal.action === "MARK_DISBURSED" && !transactionRef.trim()) {
      alert("Transaction reference is required");
      return;
    }

    setUpdatingId(modal.disbursal.id);

    try {
      await api.patch(`/disbursals/${modal.disbursal.id}/status`, {
        status: modal.action === "MARK_DISBURSED" ? "DISBURSED" : "FAILED",
        transactionRef:
          modal.action === "MARK_DISBURSED" ? transactionRef : undefined,
        adminRemarks,
      });

      closeActionModal();
      await fetchDisbursals();
    } catch {
      alert("Unable to update disbursal");
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchDisbursals();
  }, []);

  const filteredDisbursals = useMemo(() => {
    return disbursals.filter((disbursal) => {
      const value =
        `${disbursal.advanceRequest?.employee?.name} ${disbursal.advanceRequest?.employee?.email} ${disbursal.advanceRequest?.employer?.companyName} ${disbursal.status} ${disbursal.transactionRef}`.toLowerCase();

      const matchesSearch = value.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || disbursal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [disbursals, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: disbursals.length,
      pending: disbursals.filter((item) => item.status === "PENDING").length,
      disbursed: disbursals.filter((item) => item.status === "DISBURSED")
        .length,
      failed: disbursals.filter((item) => item.status === "FAILED").length,
    };
  }, [disbursals]);

  function formatAmount(value?: number) {
    if (!value) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  function getStatusClass(status?: DisbursalStatus) {
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Disbursals</p>
          <h2 className="mt-2 text-2xl font-bold">Disbursal Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track approved advance requests, process disbursals, and manage
            failed payment attempts.
          </p>
        </div>

        <button
          onClick={fetchDisbursals}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Disbursals" value={summary.total} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Disbursed" value={summary.disbursed} />
        <SummaryCard label="Failed" value={summary.failed} />
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
              placeholder="Search employee, employer, status, transaction ref..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | DisbursalStatus)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="DISBURSED">Disbursed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-2 rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
          <Loader2 className="animate-spin text-primary" size={18} />
          Loading disbursals...
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Transaction Ref</th>
                  <th className="px-5 py-4">Disbursed At</th>
                  <th className="px-5 py-4">Repayment</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDisbursals.map((disbursal) => {
                  const isUpdating = updatingId === disbursal.id;

                  return (
                    <tr key={disbursal.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                            <User size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {disbursal.advanceRequest?.employee?.name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {disbursal.advanceRequest?.employee?.email || "-"}
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
                              {disbursal.advanceRequest?.employer
                                ?.companyName || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {disbursal.advanceRequest?.employer
                                ?.companyEmail || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900">
                          <IndianRupee size={15} />
                          {formatAmount(disbursal.amount).replace("₹", "")}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                            disbursal.status
                          )}`}
                        >
                          {disbursal.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {disbursal.transactionRef || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(disbursal.disbursedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                          {disbursal.advanceRequest?.repayment?.status || "-"}
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
                            {disbursal.advanceRequest?.id && (
                              <Link
                                to={`/requests/${disbursal.advanceRequest.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                              >
                                View Request
                              </Link>
                            )}

                            {disbursal.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    openActionModal("MARK_DISBURSED", disbursal)
                                  }
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  <CheckCircle2 size={14} />
                                  Mark Disbursed
                                </button>

                                <button
                                  onClick={() =>
                                    openActionModal("MARK_FAILED", disbursal)
                                  }
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                                >
                                  <AlertTriangle size={14} />
                                  Failed
                                </button>
                              </>
                            )}

                            {disbursal.status !== "PENDING" && (
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

                {filteredDisbursals.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No disbursals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modal.open && (
        <ActionModal
          modal={modal}
          transactionRef={transactionRef}
          adminRemarks={adminRemarks}
          updating={Boolean(updatingId)}
          onClose={closeActionModal}
          onSubmit={submitAction}
          onTransactionRefChange={setTransactionRef}
          onAdminRemarksChange={setAdminRemarks}
          formatAmount={formatAmount}
        />
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

function ActionModal({
  modal,
  transactionRef,
  adminRemarks,
  updating,
  onClose,
  onSubmit,
  onTransactionRefChange,
  onAdminRemarksChange,
  formatAmount,
}: {
  modal: ActionModalState;
  transactionRef: string;
  adminRemarks: string;
  updating: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onTransactionRefChange: (value: string) => void;
  onAdminRemarksChange: (value: string) => void;
  formatAmount: (value?: number) => string;
}) {
  const action = modal.action;
  const disbursal = modal.disbursal;

  if (!action || !disbursal) return null;

  const isDisburseAction = action === "MARK_DISBURSED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isDisburseAction
                ? "Mark Payment as Disbursed"
                : "Mark Disbursal as Failed"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isDisburseAction
                ? "Enter transaction reference after payment is completed."
                : "Add remarks explaining why this disbursal failed."}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={updating}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Disbursal Summary
          </p>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Employee</span>
              <span className="font-semibold text-slate-900">
                {disbursal.advanceRequest?.employee?.name || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Employer</span>
              <span className="font-semibold text-slate-900">
                {disbursal.advanceRequest?.employer?.companyName || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">
                {formatAmount(disbursal.amount)}
              </span>
            </div>
          </div>
        </div>

        {isDisburseAction && (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Transaction Reference <span className="text-red-500">*</span>
            </span>
            <input
              value={transactionRef}
              onChange={(event) => onTransactionRefChange(event.target.value)}
              placeholder="Enter UTR / transaction ID"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </label>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">
            Admin Remarks
          </span>
          <textarea
            value={adminRemarks}
            onChange={(event) => onAdminRemarksChange(event.target.value)}
            rows={4}
            placeholder="Enter remarks"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={updating}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={updating}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${
              isDisburseAction
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {updating && <Loader2 className="animate-spin" size={16} />}
            {updating
              ? "Processing..."
              : isDisburseAction
              ? "Mark Disbursed"
              : "Mark Failed"}
          </button>
        </div>
      </div>
    </div>
  );
}
