import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCcw,
  Search,
  User,
  X,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";

type RepaymentStatus = "PENDING" | "PAID" | "OVERDUE";
type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";

type Repayment = {
  id: string;
  status: RepaymentStatus;
  amount: number;
  dueDate?: string;
  paidAt?: string | null;
  paymentRef?: string | null;
  advanceRequest?: {
    id: string;
    amount: number;
    status: string;
    employee?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      availableLimit?: number;
    };
    employer?: {
      id: string;
      companyName: string;
      companyEmail?: string;
    };
    disbursal?: {
      id: string;
      status: DisbursalStatus;
      transactionRef?: string | null;
    } | null;
  };
};

type ModalAction = "MARK_PAID" | "MARK_OVERDUE";

type ActionModalState = {
  open: boolean;
  action: ModalAction | null;
  repayment: Repayment | null;
};

export function RepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RepaymentStatus>(
    "ALL"
  );
  const [error, setError] = useState("");

  const [modal, setModal] = useState<ActionModalState>({
    open: false,
    action: null,
    repayment: null,
  });

  const [paymentRef, setPaymentRef] = useState("");

  async function fetchRepayments() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/repayments");

      const data =
        response.data?.data?.data ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setRepayments(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load repayments");
    } finally {
      setLoading(false);
    }
  }

  function openActionModal(action: ModalAction, repayment: Repayment) {
    setModal({
      open: true,
      action,
      repayment,
    });
    setPaymentRef("");
  }

  function closeActionModal() {
    if (updatingId) return;

    setModal({
      open: false,
      action: null,
      repayment: null,
    });
    setPaymentRef("");
  }

  async function submitAction() {
    if (!modal.repayment || !modal.action) return;

    if (modal.action === "MARK_PAID" && !paymentRef.trim()) {
      alert("Payment reference is required");
      return;
    }

    setUpdatingId(modal.repayment.id);

    try {
      await api.patch(`/repayments/${modal.repayment.id}/status`, {
        status: modal.action === "MARK_PAID" ? "PAID" : "OVERDUE",
        paymentRef: modal.action === "MARK_PAID" ? paymentRef : undefined,
      });

      closeActionModal();
      await fetchRepayments();
    } catch {
      alert("Unable to update repayment");
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchRepayments();
  }, []);

  const filteredRepayments = useMemo(() => {
    return repayments.filter((repayment) => {
      const value =
        `${repayment.advanceRequest?.employee?.name} ${repayment.advanceRequest?.employee?.email} ${repayment.advanceRequest?.employer?.companyName} ${repayment.status} ${repayment.paymentRef}`.toLowerCase();

      const matchesSearch = value.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || repayment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [repayments, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: repayments.length,
      pending: repayments.filter((item) => item.status === "PENDING").length,
      paid: repayments.filter((item) => item.status === "PAID").length,
      overdue: repayments.filter((item) => item.status === "OVERDUE").length,
    };
  }, [repayments]);

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

  function getStatusClass(status?: RepaymentStatus) {
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Repayments</p>
          <h2 className="mt-2 text-2xl font-bold">Repayment Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track repayment dues, mark payments as paid, and monitor overdue
            repayments.
          </p>
        </div>

        <button
          onClick={fetchRepayments}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Repayments" value={summary.total} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Paid" value={summary.paid} />
        <SummaryCard label="Overdue" value={summary.overdue} />
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
              placeholder="Search employee, employer, status, payment ref..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | RepaymentStatus)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </section>

      {loading && (
        <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
          Loading repayments...
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
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Employer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Repayment Status</th>
                  <th className="px-5 py-4">Disbursal Status</th>
                  <th className="px-5 py-4">Payment Ref</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRepayments.map((repayment) => {
                  const isUpdating = updatingId === repayment.id;

                  return (
                    <tr key={repayment.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                            <User size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {repayment.advanceRequest?.employee?.name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {repayment.advanceRequest?.employee?.email || "-"}
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
                              {repayment.advanceRequest?.employer
                                ?.companyName || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {repayment.advanceRequest?.employer
                                ?.companyEmail || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900">
                          <IndianRupee size={15} />
                          {formatAmount(repayment.amount).replace("₹", "")}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(repayment.dueDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                            repayment.status
                          )}`}
                        >
                          {repayment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getDisbursalStatusClass(
                            repayment.advanceRequest?.disbursal?.status
                          )}`}
                        >
                          {repayment.advanceRequest?.disbursal?.status || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {repayment.paymentRef || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {isUpdating ? (
                          <Loader2
                            className="animate-spin text-primary"
                            size={18}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {repayment.status !== "PAID" && (
                              <button
                                onClick={() =>
                                  openActionModal("MARK_PAID", repayment)
                                }
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                              >
                                <CheckCircle2 size={14} />
                                Mark Paid
                              </button>
                            )}

                            {repayment.status === "PENDING" && (
                              <button
                                onClick={() =>
                                  openActionModal("MARK_OVERDUE", repayment)
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                              >
                                <AlertTriangle size={14} />
                                Overdue
                              </button>
                            )}

                            {repayment.status === "PAID" && (
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

                {filteredRepayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No repayments found.
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
          paymentRef={paymentRef}
          updating={Boolean(updatingId)}
          onClose={closeActionModal}
          onSubmit={submitAction}
          onPaymentRefChange={setPaymentRef}
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
  paymentRef,
  updating,
  onClose,
  onSubmit,
  onPaymentRefChange,
  formatAmount,
}: {
  modal: ActionModalState;
  paymentRef: string;
  updating: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onPaymentRefChange: (value: string) => void;
  formatAmount: (value?: number) => string;
}) {
  const action = modal.action;
  const repayment = modal.repayment;

  if (!action || !repayment) return null;

  const isPaidAction = action === "MARK_PAID";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isPaidAction
                ? "Mark Repayment as Paid"
                : "Mark Repayment as Overdue"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isPaidAction
                ? "Enter payment reference to confirm repayment."
                : "This will mark the repayment as overdue."}
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
            Repayment Summary
          </p>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Employee</span>
              <span className="font-semibold text-slate-900">
                {repayment.advanceRequest?.employee?.name || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Employer</span>
              <span className="font-semibold text-slate-900">
                {repayment.advanceRequest?.employer?.companyName || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">
                {formatAmount(repayment.amount)}
              </span>
            </div>
          </div>
        </div>

        {isPaidAction && (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Payment Reference <span className="text-red-500">*</span>
            </span>
            <input
              value={paymentRef}
              onChange={(event) => onPaymentRefChange(event.target.value)}
              placeholder="Enter repayment transaction/reference ID"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </label>
        )}

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
              isPaidAction
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {updating && <Loader2 className="animate-spin" size={16} />}
            {updating
              ? "Processing..."
              : isPaidAction
              ? "Mark Paid"
              : "Mark Overdue"}
          </button>
        </div>
      </div>
    </div>
  );
}
