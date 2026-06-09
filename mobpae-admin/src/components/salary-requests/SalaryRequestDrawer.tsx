import { CheckCircle2, CreditCard, Loader2, X } from "lucide-react";
import { useState } from "react";
import {
  approveSalaryRequestForDisbursal,
  disburseSalaryRequest,
} from "../../services/salaryRequestService";
import type { SalaryRequest } from "../../types/salary-request";

interface SalaryRequestDrawerProps {
  open: boolean;
  request: SalaryRequest | null;
  onClose: () => void;
  onCompleted: () => void;
}

const formatMoney = (amount: number | string | null | undefined) =>
  `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;

const readableStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function SalaryRequestDrawer({
  open,
  request,
  onClose,
  onCompleted,
}: SalaryRequestDrawerProps) {
  const [submitting, setSubmitting] = useState<"approve" | "disburse" | null>(null);
  const [error, setError] = useState("");

  if (!open || !request) return null;

  const selectedRequest = request;
  const employerApproved = selectedRequest.status === "EMPLOYER_APPROVED";
  const readyForDisbursal = selectedRequest.status === "READY_FOR_DISBURSAL";
  const disbursed = selectedRequest.status === "DISBURSED" || selectedRequest.disbursal?.status === "DISBURSED";
  const canAdminApprove = employerApproved;
  const canDisburse = readyForDisbursal && Boolean(selectedRequest.disbursal?.id) && selectedRequest.disbursal?.status !== "DISBURSED";

  async function handleAdminApprove() {
    setSubmitting("approve");
    setError("");
    try {
      await approveSalaryRequestForDisbursal(selectedRequest.id);
      await onCompleted();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to approve request");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDisburse() {
    if (!selectedRequest.disbursal?.id) return;

    setSubmitting("disburse");
    setError("");
    try {
      await disburseSalaryRequest(selectedRequest.disbursal.id);
      await onCompleted();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to disburse request");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Salary Request
            </p>
            <h2 className="text-xl font-bold text-slate-900">{request.id}</h2>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Requested amount</p>
                <strong className="mt-1 block text-3xl text-slate-950">
                  {formatMoney(request.amount)}
                </strong>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {readableStatus(request.status)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info label="Requested on" value={new Date(request.requestedAt).toLocaleDateString()} />
              <Info label="Approved amount" value={formatMoney(request.approvedAmount ?? request.amount)} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Employee</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Name" value={request.employee.name} />
              <Info label="Employee code" value={request.employee.employeeCode} />
              <Info label="Email" value={request.employee.email} />
              <Info label="Employer" value={request.employee.employer.companyName} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Admin action</h3>
            <p className="mt-2 text-sm text-slate-500">
              Admin approval is available only after employer approval. Disbursal is available after admin approval.
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!employerApproved && !readyForDisbursal && !disbursed ? (
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Waiting for employer approval.
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                disabled={!canAdminApprove || submitting !== null}
                onClick={handleAdminApprove}
                type="button"
              >
                {submitting === "approve" ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                Admin approve
              </button>

              <button
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                disabled={!canDisburse || submitting !== null}
                onClick={handleDisburse}
                type="button"
              >
                {submitting === "disburse" ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                Disburse
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <strong className="mt-1 block text-sm font-semibold text-slate-900">{value}</strong>
    </div>
  );
}
