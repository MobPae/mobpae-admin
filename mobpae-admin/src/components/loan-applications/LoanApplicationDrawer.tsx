import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CreditCard, Loader2, Zap, ShieldCheck, CircleDollarSign } from "lucide-react";
import { getApiErrorMessage, isForbidden } from "../../utils/api-errors";
import { adminApproveLoanApplication, adminRejectLoanApplication, waivePlatformFee } from "../../services/loanApplicationService";
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
  EMPLOYER_REJECTED:            "bg-danger-soft text-danger",
  AWAITING_MEMBERSHIP_PAYMENT:  "bg-orange-50 text-orange-700",
  AWAITING_PLATFORM_FEE_PAYMENT:"bg-orange-50 text-orange-700",
  READY_FOR_DISBURSAL:          "bg-lime-50 text-lime-700",
  DISBURSED:                    "bg-success-bg text-success-dark",
  REPAYMENT_SCHEDULED:          "bg-warning-bg text-warning-dark",
  REPAID:                       "bg-success-bg text-[#166534]",
  CANCELLED:                    "bg-surface-muted text-ink-3",
  EXPIRED:                      "bg-surface-muted text-ink-3",
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED:                    "Submitted",
  EMPLOYER_APPROVED:            "Employer Approved",
  EMPLOYER_REJECTED:            "Rejected",
  AWAITING_MEMBERSHIP_PAYMENT:  "Platform Fee Pending",
  AWAITING_PLATFORM_FEE_PAYMENT:"Platform Fee Pending",
  READY_FOR_DISBURSAL:          "Ready for Disbursal",
  DISBURSED:                    "Disbursed",
  REPAYMENT_SCHEDULED:          "Repayment Scheduled",
  REPAID:                       "Repaid",
  CANCELLED:                    "Cancelled",
  EXPIRED:                      "Expired",
};

const fmt = (v: string | null | undefined) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const fmtAmount = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === ""
    ? "—"
    : `₹${Number(v).toLocaleString("en-IN")}`;

const fmtDateTime = (v: string | null | undefined) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PLATFORM_FEE_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  WAIVED: "Waived",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

const PLATFORM_FEE_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-orange-50 text-orange-700",
  PAID: "bg-success-bg text-success-dark",
  WAIVED: "bg-[#EDE9FE] text-[#5B21B6]",
  FAILED: "bg-danger-soft text-danger",
  EXPIRED: "bg-surface-muted text-ink-3",
};

type ConfirmAction = "admin-approve" | "approve-and-disburse" | "disburse-only" | "waive-platform-fee" | "admin-reject";

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

  // ── Waive platform fee only for exceptional admin support cases ───────────
  const waivePlatformFeeMutation = useMutation({
    mutationFn: () => waivePlatformFee(application!.platformFee!.id, "Waived by admin"),
    onSuccess: () => {
      toast.success("Platform fee waived", {
        description: "The request can now continue to admin review.",
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Unable to waive platform fee", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !application) return null;

  const status = application.status;
  const awaitingPlatformFee =
    status === "AWAITING_PLATFORM_FEE_PAYMENT" ||
    status === "AWAITING_MEMBERSHIP_PAYMENT";
  const platformFee = application.platformFee;
  const latestPaymentOrder = platformFee?.paymentOrders?.[0];
  // Admin can approve when employer has approved
  const canAdminApprove   = status === "EMPLOYER_APPROVED";
  // Admin can create disbursal + disburse when ready (no existing disbursal)
  const canApproveDisburse = (status === "EMPLOYER_APPROVED" || status === "READY_FOR_DISBURSAL") && !application.disbursal;
  // Disburse only when disbursal record exists and is still pending
  const canDisburseOnly   = status === "READY_FOR_DISBURSAL" && application.disbursal?.status === "PENDING";

  const isBusy =
    adminApproveMutation.isPending ||
    approveAndDisburseMutation.isPending ||
    disburseMutation.isPending ||
    rejectMutation.isPending ||
    waivePlatformFeeMutation.isPending;

  const displayAmount = fmt(application.adminApprovedAmount ?? application.employerApprovedAmount ?? application.requestedAmount);

  const handleConfirm = () => {
    if (confirm === "admin-approve")       adminApproveMutation.mutate();
    else if (confirm === "approve-and-disburse") approveAndDisburseMutation.mutate();
    else if (confirm === "disburse-only")  disburseMutation.mutate();
    else if (confirm === "waive-platform-fee") waivePlatformFeeMutation.mutate();
    else if (confirm === "admin-reject")   rejectMutation.mutate();
    setConfirm(null);
  };

  const confirmCfg: Record<ConfirmAction, { title: string; description: string; label: string; cls: string }> = {
    "admin-approve": {
      title: "Approve application",
      description: `This will approve ${application.employee.name}'s application (${displayAmount}) and mark it ready for disbursal.`,
      label: "Approve",
      cls: "bg-brand hover:bg-brand-hover text-white",
    },
    "approve-and-disburse": {
      title: "Approve & Disburse",
      description: `This will approve and immediately disburse ${displayAmount} to ${application.employee.name}'s bank account. This cannot be undone.`,
      label: "Approve & Disburse",
      cls: "bg-brand hover:bg-brand-hover text-white",
    },
    "disburse-only": {
      title: "Disburse funds",
      description: `This will send ${fmt(application.disbursal?.disbursedAmount)} to ${application.employee.name}'s bank account. This cannot be undone.`,
      label: "Disburse",
      cls: "bg-brand hover:bg-brand-hover text-white",
    },
    "waive-platform-fee": {
      title: "Waive platform fee",
      description: `This will waive the platform fee for ${application.employee.name}'s request and move it back to admin review. Use this only for support exceptions.`,
      label: "Waive fee",
      cls: "bg-warning hover:bg-warning-dark text-white",
    },
    "admin-reject": {
      title: "Reject application",
      description: `This will reject ${application.employee.name}'s application for ${displayAmount}. This cannot be undone and the employee will need to submit a new request.`,
      label: "Reject",
      cls: "bg-danger hover:bg-danger-dark text-white",
    },
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ink to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {application.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{application.employee.name}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{application.employer?.companyName ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[status] ?? "bg-surface-muted text-ink-3"}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:bg-surface-muted transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Platform fee is a per-request gate after employer approval. Legacy
              membership-pending rows are shown with the same business meaning. */}
          {awaitingPlatformFee && (
            <div className="flex gap-2.5 rounded-lg bg-orange-50 border border-orange-200 px-3.5 py-3">
              <span className="text-base">🔐</span>
              <div>
                <p className="text-[12px] font-[600] text-orange-800">Platform Fee Pending</p>
                <p className="text-[11px] text-orange-700 mt-0.5">
                  Employer approved this request. The employee must pay the
                  platform fee before MobPae admin review and disbursal can continue.
                </p>
              </div>
            </div>
          )}

          {(platformFee || awaitingPlatformFee) && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Platform fee</p>
              {platformFee ? (
                <div className="border border-edge rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-3 py-3 bg-canvas">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center flex-shrink-0">
                        <CircleDollarSign size={15} strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-[600] text-ink leading-tight">Per-request platform fee</p>
                        <p className="text-[11px] text-ink-3 mt-0.5 leading-tight">{fmtAmount(platformFee.amount)} {platformFee.currency}</p>
                      </div>
                    </div>
                    <span className={`inline-flex h-[20px] px-2 rounded-md items-center text-[11px] font-[600] ${PLATFORM_FEE_BADGE[platformFee.status] ?? "bg-surface-muted text-ink-3"}`}>
                      {PLATFORM_FEE_LABEL[platformFee.status] ?? platformFee.status}
                    </span>
                  </div>

                  <div className="divide-y divide-edge">
                    {[
                      { k: "Fee ID", v: <span className="font-mono text-[10px]">{platformFee.id}</span> },
                      { k: "Provider", v: platformFee.provider || "—" },
                      { k: "Order ID", v: platformFee.providerOrderId || latestPaymentOrder?.providerOrderId || "—", mono: true },
                      { k: "Payment ID", v: platformFee.providerPaymentId || latestPaymentOrder?.providerPaymentId || "—", mono: true },
                      { k: "Created", v: fmtDateTime(platformFee.createdAt) },
                      ...(platformFee.paidAt ? [{ k: "Paid at", v: fmtDateTime(platformFee.paidAt) }] : []),
                      ...(platformFee.waivedAt ? [{ k: "Waived at", v: fmtDateTime(platformFee.waivedAt) }] : []),
                      ...(platformFee.remarks ? [{ k: "Remarks", v: platformFee.remarks }] : []),
                    ].map(({ k, v, mono }) => (
                      <div key={k} className="flex items-center justify-between px-3 py-2.5 gap-3">
                        <span className="text-[11px] text-ink-3">{k}</span>
                        <span className={`text-[11px] font-[500] text-ink text-right max-w-[62%] truncate ${mono ? "font-mono" : ""}`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {platformFee.status === "PENDING_PAYMENT" && (
                    <div className="px-3 py-3 border-t border-edge bg-orange-50/40">
                      <button
                        type="button"
                        onClick={() => setConfirm("waive-platform-fee")}
                        disabled={isBusy}
                        className="w-full h-8 rounded-md border border-orange-200 bg-white text-[11px] font-[600] text-orange-700 hover:bg-orange-50 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                      >
                        {waivePlatformFeeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                        {waivePlatformFeeMutation.isPending ? "Waiving…" : "Waive fee and continue"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-3">
                  <p className="text-[12px] font-[600] text-orange-800">Fee record not available</p>
                  <p className="text-[11px] text-orange-700 mt-0.5">
                    This request is waiting for platform fee payment, but the fee record is missing from the response.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Application summary */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Application summary</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
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
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Eligibility snapshot */}
          {(() => {
            const salary    = parseFloat(application.snapshotSalaryInHand)          || 0;
            const threshold = parseFloat(application.snapshotInterestFreeThreshold) || 0;
            const requested = parseFloat(application.requestedAmount)               || 0;
            const rate      = parseFloat(application.snapshotAnnualInterestRate)    || 0;
            const pct       = application.snapshotMaxAdvancePercentage;
            const overAmt   = Math.max(0, requested - threshold);
            const withinLimit = requested <= threshold;
            const fmtN = (n: number) => `₹${n.toLocaleString("en-IN")}`;
            if (!salary) return null;
            return (
              <section>
                <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Eligibility snapshot</p>
                <div className="rounded-lg border border-edge overflow-hidden">
                  {/* Rule compliance banner */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: withinLimit ? "var(--color-success-bg)" : "var(--color-warning-bg)",
                    borderBottom: "1px solid var(--color-edge)",
                  }}>
                    <span style={{ fontSize: 15 }}>{withinLimit ? "✅" : "⚠️"}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: withinLimit ? "var(--color-success)" : "var(--color-warning)", margin: 0 }}>
                        {withinLimit
                          ? "Within interest-free limit — no interest charged"
                          : `Exceeds limit by ${fmtN(overAmt)} — interest applies on excess`}
                      </p>
                      {!withinLimit && (
                        <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>
                          Annual rate: {rate}% · Interest on {fmtN(overAmt)} excess amount
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Detail rows */}
                  {[
                    { k: "Salary in hand",               v: fmtN(salary)                               },
                    { k: `Interest-free limit (${pct}%)`, v: fmtN(threshold)                           },
                    { k: "Requested amount",              v: fmtN(requested)                            },
                    { k: "Amount above limit",            v: overAmt > 0 ? fmtN(overAmt) : "—"         },
                    { k: "Interest rate",                 v: withinLimit ? "0% (free)" : `${rate}% p.a.`},
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between px-3 py-2.5 border-b border-edge last:border-0">
                      <span className="text-[11px] text-ink-3">{k}</span>
                      <span className="text-[11px] font-[500] text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Employee */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Employee</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Name",          v: application.employee.name },
                { k: "Employee code", v: <span className="font-mono">{application.employee.employeeCode}</span> },
                { k: "Email",         v: application.employee.email },
                { k: "Employer",      v: application.employer?.companyName ?? "—" },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disbursal info */}
          {application.disbursal && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Disbursal</p>
              <div className="border border-edge rounded-lg divide-y divide-edge">
                {[
                  { k: "Amount",     v: fmt(application.disbursal.disbursedAmount) },
                  { k: "Status",     v: application.disbursal.status },
                  ...(application.disbursal.completedAt ? [{ k: "Completed on", v: new Date(application.disbursal.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-ink-3">{k}</span>
                    <span className="text-[11px] font-[500] text-ink">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repayment info */}
          {application.repayment && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Repayment</p>
              <div className="border border-edge rounded-lg divide-y divide-edge">
                {[
                  { k: "Total amount", v: fmt(application.repayment.totalAmount) },
                  { k: "Due date",     v: new Date(application.repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                  { k: "Status",       v: application.repayment.status },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[11px] text-ink-3">{k}</span>
                    <span className="text-[11px] font-[500] text-ink">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No action note */}
          {!canAdminApprove && !canApproveDisburse && !canDisburseOnly && (
            <div className="bg-canvas rounded-md px-3 py-2.5 border border-edge">
              <p className="text-[11px] text-ink-3 leading-relaxed">
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
          <div className="border-t border-edge px-5 py-3.5 flex-shrink-0 space-y-2">
            {/* Primary: Approve & Disburse (all-in-one) */}
            {canApproveDisburse && (
              <button
                onClick={() => setConfirm("approve-and-disburse")}
                disabled={isBusy}
                className="w-full h-8 rounded-md bg-brand hover:bg-brand-hover text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
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
                className="w-full h-7 rounded-md border border-edge text-[11px] font-[500] text-ink-3 hover:bg-canvas flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
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
                className="w-full h-8 rounded-md bg-brand hover:bg-brand-hover text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
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
                onClick={() => setConfirm("admin-reject")}
                disabled={isBusy}
                className="w-full h-7 rounded-md border border-[#FECACA] text-[11px] font-[500] text-danger hover:bg-danger-soft flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
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
