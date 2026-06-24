import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, CreditCard, Loader2, Zap } from "lucide-react";
import { getApiErrorMessage, isForbidden } from "../../utils/api-errors";
import {
  approveSalaryRequestForDisbursal,
  disburseSalaryRequest,
} from "../../services/salaryRequestService";
import type { SalaryRequest } from "../../types/salary-request";
import { ConfirmModal } from "../ui/ConfirmModal";

interface Props {
  open: boolean;
  request: SalaryRequest | null;
  onClose: () => void;
  onMutated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED:           "bg-amber-50 text-amber-700",
  EMPLOYER_APPROVED:   "bg-[#DBEAFE] text-[#1D4ED8]",
  EMPLOYER_REJECTED:   "bg-red-50 text-red-600",
  READY_FOR_DISBURSAL: "bg-lime-50 text-lime-700",
  DISBURSED:           "bg-[#DCFCE7] text-[#15803D]",
  REPAYMENT_SCHEDULED: "bg-[#FEF3C7] text-[#B45309]",
  REPAID:              "bg-[#DCFCE7] text-[#166534]",
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

type ConfirmAction = "approve-and-disburse" | "approve-only" | "disburse";

export default function SalaryRequestDrawer({ open, request, onClose, onMutated }: Props) {
  useEscKey(open, onClose);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  // ── Approve only → status becomes READY_FOR_DISBURSAL ──────────────────────
  const approveMutation = useMutation({
    mutationFn: () => approveSalaryRequestForDisbursal(request!.id),
    onSuccess: () => {
      toast.success("Approved for disbursal", {
        description: `${request?.employee.name}'s request is queued for disbursal.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Approval failed", {
        description: isForbidden(err)
          ? "You don't have permission to approve this request."
          : getApiErrorMessage(err),
      });
    },
  });

  // ── Approve + immediately disburse (one click) ──────────────────────────────
  const approveAndDisburseMutation = useMutation({
    mutationFn: async () => {
      const disbursal = await approveSalaryRequestForDisbursal(request!.id);
      await disburseSalaryRequest(disbursal.id);
    },
    onSuccess: () => {
      toast.success("Approved & disbursed", {
        description: `${fmt(request?.approvedAmount ?? request?.amount)} sent to ${request?.employee.name}.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Action failed", {
        description: isForbidden(err)
          ? "You don't have permission to perform this action."
          : getApiErrorMessage(err),
      });
    },
  });

  // ── Disburse only (when already READY_FOR_DISBURSAL) ───────────────────────
  const disburseMutation = useMutation({
    mutationFn: () => disburseSalaryRequest(request!.disbursal!.id),
    onSuccess: () => {
      toast.success("Disbursed", {
        description: `${fmt(request?.approvedAmount ?? request?.amount)} sent to ${request?.employee.name}.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Disbursal failed", {
        description: isForbidden(err)
          ? "You don't have permission to disburse this request."
          : getApiErrorMessage(err),
      });
    },
  });

  if (!open || !request) return null;

  const canApprove  = request.status === "EMPLOYER_APPROVED";
  const canDisburse = request.status === "READY_FOR_DISBURSAL"
    && !!request.disbursal?.id
    && request.disbursal.status !== "DISBURSED";
  const isBusy = approveMutation.isPending || approveAndDisburseMutation.isPending || disburseMutation.isPending;

  const handleConfirm = () => {
    if (confirm === "approve-and-disburse") approveAndDisburseMutation.mutate();
    else if (confirm === "approve-only")    approveMutation.mutate();
    else if (confirm === "disburse")        disburseMutation.mutate();
    setConfirm(null);
  };

  const confirmCfg: Record<ConfirmAction, { title: string; description: string; label: string; cls: string }> = {
    "approve-and-disburse": {
      title: "Approve & Disburse",
      description: `This will approve ${request.employee.name}'s request and immediately send ${fmt(request.approvedAmount ?? request.amount)} to their bank account. This cannot be undone.`,
      label: "Approve & Disburse",
      cls: "bg-[#6C4CFF] hover:bg-[#5B34FF] text-white",
    },
    "approve-only": {
      title: "Approve for disbursal",
      description: `This will approve ${request.employee.name}'s request and mark it ready for disbursal. You can disburse separately.`,
      label: "Approve",
      cls: "bg-[#6C4CFF] hover:bg-[#5B34FF] text-white",
    },
    "disburse": {
      title: "Disburse funds",
      description: `This will send ${fmt(request.disbursal?.amount ?? request.approvedAmount)} to ${request.employee.name}'s bank account. This cannot be undone.`,
      label: "Disburse",
      cls: "bg-[#6C4CFF] hover:bg-[#5B34FF] text-white",
    },
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-[#E5E7EB] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {request.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#111827] leading-none">{request.employee.name}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">{request.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[request.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Amount summary */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Request summary</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Requested amount",  v: fmt(request.amount) },
                { k: "Approved amount",   v: fmt(request.approvedAmount) },
                { k: "Reason",            v: request.reason ?? "Not provided" },
                { k: "Requested on",      v: new Date(request.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(request.approvedAt ? [{ k: "Approved on", v: new Date(request.approvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(request.remarks ? [{ k: "Remarks", v: request.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Employee</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Name",          v: request.employee.name },
                { k: "Employee code", v: <span className="font-mono">{request.employee.employeeCode}</span> },
                { k: "Email",         v: request.employee.email },
                { k: "Employer",      v: request.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disbursal info if exists */}
          {request.disbursal && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Disbursal</p>
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                {[
                  { k: "Amount",     v: fmt(request.disbursal.amount) },
                  { k: "Status",     v: request.disbursal.status },
                  ...(request.disbursal.disbursedAt ? [{ k: "Disbursed on", v: new Date(request.disbursal.disbursedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-[#6B7280]">{k}</span>
                    <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repayment info if exists */}
          {request.repayment && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Repayment</p>
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                {[
                  { k: "Total amount", v: fmt(request.repayment.totalAmount) },
                  { k: "Due date",     v: new Date(request.repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                  { k: "Status",       v: request.repayment.status },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-[#6B7280]">{k}</span>
                    <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Info note when no action available */}
          {!canApprove && !canDisburse && (
            <div className="bg-[#F8F9FC] rounded-md px-3 py-2.5 border border-[#E5E7EB]">
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
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
        {canApprove && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0 space-y-2">
            <button
              onClick={() => setConfirm("approve-and-disburse")}
              disabled={isBusy}
              className="w-full h-8 rounded-md bg-[#6C4CFF] hover:bg-[#5B34FF] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {approveAndDisburseMutation.isPending
                ? <Loader2 size={12} className="animate-spin" />
                : <Zap size={12} />}
              {approveAndDisburseMutation.isPending ? "Processing…" : `Approve & Disburse ${fmt(request.approvedAmount ?? request.amount)}`}
            </button>
            <button
              onClick={() => setConfirm("approve-only")}
              disabled={isBusy}
              className="w-full h-7 rounded-md border border-[#E5E7EB] text-[11px] font-[500] text-[#6B7280] hover:bg-[#F8F9FC] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {approveMutation.isPending
                ? <Loader2 size={11} className="animate-spin" />
                : <CheckCircle2 size={11} />}
              {approveMutation.isPending ? "Approving…" : "Approve only (disburse later)"}
            </button>
          </div>
        )}

        {canDisburse && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0">
            <button
              onClick={() => setConfirm("disburse")}
              disabled={isBusy}
              className="w-full h-8 rounded-md bg-[#6C4CFF] hover:bg-[#5B34FF] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {disburseMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
              {disburseMutation.isPending ? "Disbursing…" : `Disburse ${fmt(request.disbursal?.amount ?? request.approvedAmount)}`}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <ConfirmModal
          open
          title={confirmCfg[confirm].title}
          description={confirmCfg[confirm].description}
          confirmLabel={confirmCfg[confirm].label}
          confirmClass={confirmCfg[confirm].cls}
          loading={isBusy}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
