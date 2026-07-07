import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CreditCard, Loader2, Zap, ShieldCheck } from "lucide-react";
import { getApiErrorMessage, isForbidden } from "../../utils/api-errors";
import { adminApproveLoanApplication, adminRejectLoanApplication } from "../../services/loanApplicationService";
import { createDisbursal, processDisbursal } from "../../services/disbursalService";
import type { LoanApplication } from "../../types/loan-application";
import { ConfirmModal } from "../ui/ConfirmModal";

interface Props {
  open: boolean;
  application: LoanApplication | null;
  onClose: () => void;
  onMutated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED:                    "bg-amber-50 text-amber-700",
  EMPLOYER_APPROVED:            "bg-[#DBEAFE] text-[#1D4ED8]",
  EMPLOYER_REJECTED:            "bg-red-50 text-red-600",
  AWAITING_MEMBERSHIP_PAYMENT:  "bg-orange-50 text-orange-700",
  READY_FOR_DISBURSAL:          "bg-lime-50 text-lime-700",
  DISBURSED:                    "bg-[#DCFCE7] text-[#15803D]",
  REPAYMENT_SCHEDULED:          "bg-[#FEF3C7] text-[#B45309]",
  REPAID:                       "bg-[#DCFCE7] text-[#166534]",
  CANCELLED:                    "bg-[#F3F4F6] text-[#6B7280]",
  EXPIRED:                      "bg-[#F3F4F6] text-[#6B7280]",
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED:                    "Submitted",
  EMPLOYER_APPROVED:            "Employer Approved",
  EMPLOYER_REJECTED:            "Rejected",
  AWAITING_MEMBERSHIP_PAYMENT:  "Awaiting Membership",
  READY_FOR_DISBURSAL:          "Ready for Disbursal",
  DISBURSED:                    "Disbursed",
  REPAYMENT_SCHEDULED:          "Repayment Scheduled",
  REPAID:                       "Repaid",
  CANCELLED:                    "Cancelled",
  EXPIRED:                      "Expired",
};

const fmt = (v: string | null | undefined) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

type ConfirmAction = "admin-approve" | "approve-and-disburse" | "disburse-only";

export default function LoanApplicationDrawer({ open, application, onClose, onMutated }: Props) {
  useEscKey(open, onClose);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  // ── Admin approve (EMPLOYER_APPROVED → READY_FOR_DISBURSAL) ───────────────
  const adminApproveMutation = useMutation({
    mutationFn: () => adminApproveLoanApplication(application!.id),
    onSuccess: () => {
      toast.success("Application approved", {
        description: `${application?.employee.name}'s application is ready for disbursal.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Approval failed", {
        description: isForbidden(err)
          ? "You don't have permission to approve this application."
          : getApiErrorMessage(err),
      });
    },
  });

  // ── Approve + immediately disburse ────────────────────────────────────────
  const approveAndDisburseMutation = useMutation({
    mutationFn: async () => {
      // Step 1: admin approve (only if still EMPLOYER_APPROVED)
      if (application!.status === "EMPLOYER_APPROVED") {
        await adminApproveLoanApplication(application!.id);
      }
      // Step 2: create disbursal record
      const disbursal = await createDisbursal(application!.id);
      // Step 3: disburse
      await processDisbursal(disbursal.id);
    },
    onSuccess: () => {
      const amount = fmt(application?.adminApprovedAmount ?? application?.employerApprovedAmount ?? application?.requestedAmount);
      toast.success("Approved & disbursed", {
        description: `${amount} sent to ${application?.employee.name}.`,
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

  // ── Disburse only (READY_FOR_DISBURSAL with pending disbursal) ─────────────
  const disburseMutation = useMutation({
    mutationFn: () => processDisbursal(application!.disbursal!.id),
    onSuccess: () => {
      toast.success("Disbursed", {
        description: `${fmt(application?.disbursal?.disbursedAmount)} sent to ${application?.employee.name}.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Disbursal failed", {
        description: isForbidden(err)
          ? "You don't have permission to disburse this application."
          : getApiErrorMessage(err),
      });
    },
  });

  // ── Admin reject ──────────────────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: () => adminRejectLoanApplication(application!.id, "Rejected by admin"),
    onSuccess: () => {
      toast.success("Application rejected");
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !application) return null;

  const status = application.status;
  // Admin can approve when employer has approved
  const canAdminApprove   = status === "EMPLOYER_APPROVED";
  // Admin can create disbursal + disburse when ready (no existing disbursal)
  const canApproveDisburse = (status === "EMPLOYER_APPROVED" || status === "READY_FOR_DISBURSAL") && !application.disbursal;
  // Disburse only when disbursal record exists and is still pending
  const canDisburseOnly   = status === "READY_FOR_DISBURSAL" && application.disbursal?.status === "PENDING";

  const isBusy = adminApproveMutation.isPending || approveAndDisburseMutation.isPending || disburseMutation.isPending || rejectMutation.isPending;

  const displayAmount = fmt(application.adminApprovedAmount ?? application.employerApprovedAmount ?? application.requestedAmount);

  const handleConfirm = () => {
    if (confirm === "admin-approve")       adminApproveMutation.mutate();
    else if (confirm === "approve-and-disburse") approveAndDisburseMutation.mutate();
    else if (confirm === "disburse-only")  disburseMutation.mutate();
    setConfirm(null);
  };

  const confirmCfg: Record<ConfirmAction, { title: string; description: string; label: string; cls: string }> = {
    "admin-approve": {
      title: "Approve application",
      description: `This will approve ${application.employee.name}'s application (${displayAmount}) and mark it ready for disbursal.`,
      label: "Approve",
      cls: "bg-[#6C4CFF] hover:bg-[#5B34FF] text-white",
    },
    "approve-and-disburse": {
      title: "Approve & Disburse",
      description: `This will approve and immediately disburse ${displayAmount} to ${application.employee.name}'s bank account. This cannot be undone.`,
      label: "Approve & Disburse",
      cls: "bg-[#6C4CFF] hover:bg-[#5B34FF] text-white",
    },
    "disburse-only": {
      title: "Disburse funds",
      description: `This will send ${fmt(application.disbursal?.disbursedAmount)} to ${application.employee.name}'s bank account. This cannot be undone.`,
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
              {application.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#111827] leading-none">{application.employee.name}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">{application.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Awaiting membership banner */}
          {status === "AWAITING_MEMBERSHIP_PAYMENT" && (
            <div className="flex gap-2.5 rounded-lg bg-orange-50 border border-orange-200 px-3.5 py-3">
              <span className="text-base">🔐</span>
              <div>
                <p className="text-[12px] font-[600] text-orange-800">Awaiting Membership Payment</p>
                <p className="text-[11px] text-orange-700 mt-0.5">
                  Employer approved, but employee has no active membership.
                  This will auto-advance to Ready for Disbursal once membership is activated.
                </p>
              </div>
            </div>
          )}

          {/* Application summary */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Application summary</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Application No.",   v: <span className="font-mono text-[11px]">{application.applicationNumber}</span> },
                { k: "Requested amount",  v: fmt(application.requestedAmount) },
                { k: "Employer approved", v: fmt(application.employerApprovedAmount) },
                { k: "Admin approved",    v: fmt(application.adminApprovedAmount) },
                { k: "Purpose",           v: application.purposeCategory.replace(/_/g, " ") },
                ...(application.purposeNote ? [{ k: "Note", v: application.purposeNote }] : []),
                { k: "Submitted on",      v: new Date(application.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(application.remarks ? [{ k: "Remarks", v: application.remarks }] : []),
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
                { k: "Name",          v: application.employee.name },
                { k: "Employee code", v: <span className="font-mono">{application.employee.employeeCode}</span> },
                { k: "Email",         v: application.employee.email },
                { k: "Employer",      v: application.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disbursal info */}
          {application.disbursal && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Disbursal</p>
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                {[
                  { k: "Amount",     v: fmt(application.disbursal.disbursedAmount) },
                  { k: "Status",     v: application.disbursal.status },
                  ...(application.disbursal.disbursedAt ? [{ k: "Disbursed on", v: new Date(application.disbursal.disbursedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-[#6B7280]">{k}</span>
                    <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repayment info */}
          {application.repayment && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Repayment</p>
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                {[
                  { k: "Total amount", v: fmt(application.repayment.totalAmount) },
                  { k: "Due date",     v: new Date(application.repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                  { k: "Status",       v: application.repayment.status },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-[#6B7280]">{k}</span>
                    <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No action note */}
          {!canAdminApprove && !canApproveDisburse && !canDisburseOnly && (
            <div className="bg-[#F8F9FC] rounded-md px-3 py-2.5 border border-[#E5E7EB]">
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                {status === "SUBMITTED"
                  ? "Waiting for employer to review and approve this application."
                  : status === "EMPLOYER_REJECTED"
                  ? "This application was rejected by the employer."
                  : status === "CANCELLED"
                  ? "This application was cancelled by the employee."
                  : status === "EXPIRED"
                  ? "This application expired without action."
                  : "No further action required."}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(canAdminApprove || canApproveDisburse || canDisburseOnly) && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0 space-y-2">
            {/* Primary: Approve & Disburse (all-in-one) */}
            {canApproveDisburse && (
              <button
                onClick={() => setConfirm("approve-and-disburse")}
                disabled={isBusy}
                className="w-full h-8 rounded-md bg-[#6C4CFF] hover:bg-[#5B34FF] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {approveAndDisburseMutation.isPending
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Zap size={12} />}
                {approveAndDisburseMutation.isPending ? "Processing…" : `Approve & Disburse ${displayAmount}`}
              </button>
            )}

            {/* Secondary: Admin Approve only */}
            {canAdminApprove && (
              <button
                onClick={() => setConfirm("admin-approve")}
                disabled={isBusy}
                className="w-full h-7 rounded-md border border-[#E5E7EB] text-[11px] font-[500] text-[#6B7280] hover:bg-[#F8F9FC] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {adminApproveMutation.isPending
                  ? <Loader2 size={11} className="animate-spin" />
                  : <ShieldCheck size={11} />}
                {adminApproveMutation.isPending ? "Approving…" : "Approve only (disburse later)"}
              </button>
            )}

            {/* Disburse pending disbursal */}
            {canDisburseOnly && (
              <button
                onClick={() => setConfirm("disburse-only")}
                disabled={isBusy}
                className="w-full h-8 rounded-md bg-[#6C4CFF] hover:bg-[#5B34FF] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {disburseMutation.isPending
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CreditCard size={12} />}
                {disburseMutation.isPending ? "Disbursing…" : `Disburse ${fmt(application.disbursal?.disbursedAmount)}`}
              </button>
            )}

            {/* Reject (shown alongside approve) */}
            {canAdminApprove && (
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={isBusy}
                className="w-full h-7 rounded-md border border-[#FECACA] text-[11px] font-[500] text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {rejectMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : null}
                {rejectMutation.isPending ? "Rejecting…" : "Admin Reject"}
              </button>
            )}
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
