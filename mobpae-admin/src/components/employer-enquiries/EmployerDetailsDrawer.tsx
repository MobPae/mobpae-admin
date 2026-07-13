import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, Building2, CheckCircle2, Loader2, Phone, X } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { updateEnquiryStatus } from "../../services/employerEnquiryService";
import type { EmployerEnquiry } from "../../types/employer-enquiry";

interface Props {
  open: boolean;
  onClose: () => void;
  employer: EmployerEnquiry | null;
  onCreateEmployer: (enquiry: EmployerEnquiry) => void;
}

const STATUS_CONFIG: Record<string, { cls: string; label: string }> = {
  NEW:       { cls: "bg-amber-50 text-amber-700", label: "New" },
  CONTACTED: { cls: "bg-[#DBEAFE] text-[#1D4ED8]", label: "Contacted" },
  APPROVED:  { cls: "bg-success-bg text-success-dark", label: "Onboarded" },
  ONBOARDED: { cls: "bg-success-bg text-success-dark", label: "Onboarded" },
  REJECTED:  { cls: "bg-danger-soft text-danger", label: "Rejected" },
};

export default function EmployerDetailsDrawer({ open, onClose, employer, onCreateEmployer }: Props) {
  useEscKey(open, onClose);
  const qc = useQueryClient();
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ status, remarks }: { status: string; remarks?: string }) =>
      updateEnquiryStatus(employer!.id, status as EmployerEnquiry["status"], remarks),
    onSuccess: (_data, vars) => {
      const labels: Record<string, string> = {
        CONTACTED: "marked as contacted",
        REJECTED:  "rejected",
        ONBOARDED: "marked as onboarded",
      };
      toast.success(`Lead ${labels[vars.status] ?? "updated"}`, {
        description: employer?.companyName,
      });
      void qc.invalidateQueries({ queryKey: ["employer-enquiries"] });
      setRejectMode(false);
      setRejectRemarks("");
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Update failed", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !employer) return null;

  const statusCfg = STATUS_CONFIG[employer.status] ?? { cls: "bg-surface-muted text-ink-3", label: employer.status };
  const isOnboarded = employer.status === "ONBOARDED" || employer.status === "APPROVED";
  const isRejected  = employer.status === "REJECTED";
  const canContact  = employer.status === "NEW";
  const canReject   = employer.status === "NEW" || employer.status === "CONTACTED";
  const isBusy      = statusMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{employer.companyName}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{employer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Lead details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Lead details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Contact person", v: employer.contactPerson },
                { k: "Email",          v: employer.email         },
                { k: "Phone",          v: employer.phone         },
                { k: "Est. employees", v: employer.employeeCount != null ? employer.employeeCount.toLocaleString("en-IN") : "Not specified" },
                { k: "Submitted",      v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(employer.remarks ? [{ k: "Remarks", v: employer.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{String(v)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Status info */}
          {isOnboarded && (
            <div className="rounded-lg bg-brand-soft border border-[#EEF2FF] px-4 py-3 flex items-start gap-3">
              <CheckCircle2 size={15} className="text-brand flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#2048EE] leading-relaxed">
                This company has been onboarded. Their employer account is active in the{" "}
                <span className="font-[600]">Employers</span> module.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="rounded-lg bg-danger-soft border border-red-100 px-4 py-3 flex items-start gap-3">
              <Ban size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-danger leading-relaxed">
                This enquiry has been rejected.
              </p>
            </div>
          )}

          {/* Reject inline form */}
          {rejectMode && (
            <div className="rounded-lg bg-danger-soft border border-red-100 px-4 py-4 space-y-3">
              <p className="text-[12px] font-[600] text-red-800">Reject this enquiry</p>
              <textarea
                value={rejectRemarks}
                onChange={e => setRejectRemarks(e.target.value)}
                placeholder="Reason for rejection (optional)…"
                rows={3}
                className="w-full px-3 py-2 text-[12px] bg-white border border-red-200 rounded-lg text-ink placeholder-[#D1D5DB] focus:outline-none focus:border-red-400 resize-none transition"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => statusMutation.mutate({ status: "REJECTED", remarks: rejectRemarks || undefined })}
                  disabled={isBusy}
                  className="flex-1 h-8 rounded-md bg-red-600 hover:bg-red-700 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                  {isBusy ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button
                  onClick={() => { setRejectMode(false); setRejectRemarks(""); }}
                  disabled={isBusy}
                  className="px-3 h-8 rounded-md border border-edge text-[12px] text-ink-3 hover:bg-canvas disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action hints for actionable states */}
          {!isOnboarded && !isRejected && !rejectMode && (
            <div className="rounded-lg bg-canvas border border-edge px-4 py-3">
              <p className="text-[11px] text-ink-3 leading-relaxed">
                {employer.status === "CONTACTED"
                  ? "Lead has been contacted. Create an employer account to onboard them."
                  : "Create an employer account using the lead details above. The form will be pre-filled for you."}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-edge px-5 py-3.5 flex-shrink-0 space-y-2">
          {isOnboarded ? (
            <div className="flex items-center justify-center gap-2 h-8 text-[12px] font-[500] text-brand">
              <CheckCircle2 size={13} />
              Onboarding complete
            </div>
          ) : isRejected ? (
            <div className="flex items-center justify-center gap-2 h-8 text-[12px] font-[500] text-ink-3">
              <Ban size={13} />
              Enquiry rejected
            </div>
          ) : (
            <>
              {/* Primary: Create Employer */}
              <button
                onClick={() => { onClose(); onCreateEmployer(employer); }}
                className="w-full h-8 rounded-md bg-[#111827] hover:bg-[#111827] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 size={13} />
                Create Employer
              </button>

              {/* Secondary row */}
              <div className="flex gap-2">
                {canContact && (
                  <button
                    onClick={() => statusMutation.mutate({ status: "CONTACTED" })}
                    disabled={isBusy}
                    className="flex-1 h-7 rounded-md border border-edge text-[11px] font-[500] text-brand hover:bg-brand-soft flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    {isBusy && statusMutation.variables?.status === "CONTACTED"
                      ? <Loader2 size={11} className="animate-spin" />
                      : <Phone size={11} />}
                    Mark Contacted
                  </button>
                )}
                {canReject && !rejectMode && (
                  <button
                    onClick={() => setRejectMode(true)}
                    disabled={isBusy}
                    className="flex-1 h-7 rounded-md border border-red-100 text-[11px] font-[500] text-danger hover:bg-danger-soft flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    <Ban size={11} />
                    Reject
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
