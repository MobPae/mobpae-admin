import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import {
  approveSalaryRequestForDisbursal,
  disburseSalaryRequest,
} from "../../services/salaryRequestService";
import type { SalaryRequest } from "../../types/salary-request";

interface Props {
  open: boolean;
  request: SalaryRequest | null;
  onClose: () => void;
  onMutated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED:           "bg-amber-50 text-amber-700",
  EMPLOYER_APPROVED:   "bg-blue-50 text-blue-700",
  EMPLOYER_REJECTED:   "bg-red-50 text-red-600",
  READY_FOR_DISBURSAL: "bg-indigo-50 text-indigo-700",
  DISBURSED:           "bg-emerald-50 text-emerald-700",
  REPAYMENT_SCHEDULED: "bg-violet-50 text-violet-700",
  REPAID:              "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED:           "Submitted",
  EMPLOYER_APPROVED:   "Employer Approved",
  EMPLOYER_REJECTED:   "Rejected",
  READY_FOR_DISBURSAL: "Ready for Disbursal",
  DISBURSED:           "Disbursed",
  REPAYMENT_SCHEDULED: "Repayment Scheduled",
  REPAID:              "Repaid",
};

const fmt = (v: string | null | undefined) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

export default function SalaryRequestDrawer({ open, request, onClose, onMutated }: Props) {
  const [disbursing, setDisbursing] = useState(false);

  const approveMutation = useMutation({
    mutationFn: () => approveSalaryRequestForDisbursal(request!.id),
    onSuccess: () => {
      toast.success("Approved for disbursal", {
        description: `${request?.employee.name}'s request is ready to disburse.`,
      });
      onMutated();
    },
    onError: (err: unknown) => {
      toast.error("Approval failed", { description: err instanceof Error ? err.message : "Unexpected error" });
    },
  });

  const disburseMutation = useMutation({
    mutationFn: () => disburseSalaryRequest(request!.disbursal!.id),
    onSuccess: () => {
      toast.success("Disbursed", {
        description: `₹${Number(request?.amount).toLocaleString("en-IN")} sent to ${request?.employee.name}.`,
      });
      onMutated();
    },
    onError: (err: unknown) => {
      toast.error("Disbursal failed", { description: err instanceof Error ? err.message : "Unexpected error" });
    },
  });

  if (!open || !request) return null;

  const canApprove  = request.status === "EMPLOYER_APPROVED";
  const canDisburse = request.status === "READY_FOR_DISBURSAL" && !!request.disbursal?.id && request.disbursal.status !== "DISBURSED";
  const isBusy      = approveMutation.isPending || disburseMutation.isPending || disbursing;

  // suppress unused warning
  void setDisbursing;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {request.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{request.employee.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{request.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[request.status] ?? "bg-slate-100 text-slate-500"}`}>
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Amount summary */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Request summary</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Requested amount",  v: fmt(request.amount) },
                { k: "Approved amount",   v: fmt(request.approvedAmount) },
                { k: "Reason",            v: request.reason ?? "Not provided" },
                { k: "Requested on",      v: new Date(request.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(request.approvedAt ? [{ k: "Approved on", v: new Date(request.approvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(request.remarks ? [{ k: "Remarks", v: request.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Employee</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Name",          v: request.employee.name },
                { k: "Employee code", v: <span className="font-mono">{request.employee.employeeCode}</span> },
                { k: "Email",         v: request.employee.email },
                { k: "Employer",      v: request.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disbursal info if exists */}
          {request.disbursal && (
            <section>
              <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Disbursal</p>
              <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
                {[
                  { k: "Amount",     v: fmt(request.disbursal.amount) },
                  { k: "Status",     v: request.disbursal.status },
                  ...(request.disbursal.disbursedAt ? [{ k: "Disbursed on", v: new Date(request.disbursal.disbursedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-slate-400">{k}</span>
                    <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repayment info if exists */}
          {request.repayment && (
            <section>
              <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Repayment</p>
              <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
                {[
                  { k: "Total amount", v: fmt(request.repayment.totalAmount) },
                  { k: "Due date",     v: new Date(request.repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                  { k: "Status",       v: request.repayment.status },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-slate-400">{k}</span>
                    <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Info note when no action available */}
          {!canApprove && !canDisburse && (
            <div className="bg-slate-50 rounded-md px-3 py-2.5 border border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {request.status === "SUBMITTED"
                  ? "Waiting for employer to review and approve this request."
                  : request.status === "EMPLOYER_REJECTED"
                  ? "This request was rejected by the employer."
                  : "No further action required for this request."}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(canApprove || canDisburse) && (
          <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0 flex gap-2">
            {canApprove && (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={isBusy}
                className="flex-1 h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                {approveMutation.isPending ? "Approving…" : "Approve for disbursal"}
              </button>
            )}
            {canDisburse && (
              <button
                onClick={() => disburseMutation.mutate()}
                disabled={isBusy}
                className="flex-1 h-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {disburseMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
                {disburseMutation.isPending ? "Disbursing…" : "Disburse"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
