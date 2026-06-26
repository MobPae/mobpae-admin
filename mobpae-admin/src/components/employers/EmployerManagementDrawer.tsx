import { useEscKey } from "../../lib/useEscKey";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Ban, CheckCircle2, Loader2, RotateCcw, Copy, Mail, RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { updateEmployerStatus } from "../../services/employerService";
import { processRecovery } from "../../services/payrollService";
import { getSalaryRequestsByEmployer } from "../../services/salaryRequestService";
import type { Employer } from "../../types/employer";
import type { SalaryRequest } from "../../types/salary-request";

interface Props {
  open: boolean;
  onClose: () => void;
  onMutated: () => void;
  employer: Employer | null;
}

const STATUS_BADGE: Record<Employer["status"], { cls: string; label: string }> = {
  ACTIVE:    { cls: "bg-[#DCFCE7] text-[#15803D]", label: "Active" },
  PENDING:   { cls: "bg-amber-50 text-amber-700", label: "Pending" },
  APPROVED:  { cls: "bg-[#DCFCE7] text-[#15803D]", label: "Approved" },
  REJECTED:  { cls: "bg-red-50 text-red-600", label: "Rejected" },
  INACTIVE:  { cls: "bg-[#F3F4F6] text-[#6B7280]", label: "Inactive" },
  SUSPENDED: { cls: "bg-[#FEF3C7] text-[#B45309]", label: "Suspended" },
};

const RISK_BADGE: Record<Employer["riskStatus"], string> = {
  GOOD:    "bg-[#DCFCE7] text-[#15803D]",
  WARNING: "bg-[#FEF3C7] text-[#B45309]",
  BLOCKED: "bg-red-50 text-red-600",
};

const SR_STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED:            { cls: "bg-amber-50 text-amber-700", label: "Submitted" },
  EMPLOYER_APPROVED:    { cls: "bg-[#DBEAFE] text-[#1D4ED8]", label: "Emp. Approved" },
  EMPLOYER_REJECTED:    { cls: "bg-red-50 text-red-600", label: "Rejected" },
  READY_FOR_DISBURSAL:  { cls: "bg-lime-50 text-lime-700", label: "Ready" },
  DISBURSED:            { cls: "bg-[#DCFCE7] text-[#15803D]", label: "Disbursed" },
  REPAYMENT_SCHEDULED:  { cls: "bg-[#FEF3C7] text-[#B45309]", label: "Repaying" },
  REPAID:               { cls: "bg-[#DCFCE7] text-[#166534]", label: "Repaid" },
};

export default function EmployerManagementDrawer({ open, onClose, onMutated, employer }: Props) {
  useEscKey(open, onClose);
  const [suspendConfirm,    setSuspendConfirm]    = useState(false);
  const [recoveryConfirm,   setRecoveryConfirm]   = useState(false);
  const [tempPassword,      setTempPassword]      = useState<string | null>(null);
  const [copiedPassword,    setCopiedPassword]    = useState(false);

  useEffect(() => {
    if (open) { setSuspendConfirm(false); setRecoveryConfirm(false); setTempPassword(null); }
  }, [open, employer?.id]);

  const { data: recentRequests = [], isLoading: reqLoading } = useQuery<SalaryRequest[]>({
    queryKey: ["salary-requests-employer", employer?.id],
    queryFn: () => getSalaryRequestsByEmployer(employer!.id, 10),
    enabled: open && !!employer?.id,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (status: Employer["status"]) => updateEmployerStatus(employer!.id, status),
    onSuccess: (data, status) => {
      const labels: Record<Employer["status"], string> = {
        ACTIVE: "activated", INACTIVE: "deactivated", SUSPENDED: "suspended",
        PENDING: "set to pending", APPROVED: "approved", REJECTED: "rejected",
      };
      onMutated();
      // Activation may return credentials the email failed to deliver
      if (status === "ACTIVE" && data.emailDelivered === false && data.temporaryPassword) {
        setTempPassword(data.temporaryPassword);
      } else {
        if (status === "ACTIVE" && data.emailDelivered) {
          toast.success("Login credentials emailed successfully", {
            description: `${employer?.companyName} has been activated.`,
          });
        } else {
          toast.success(`Employer ${labels[status]}`, {
            description: `${employer?.companyName} has been ${labels[status]}.`,
          });
        }
        onClose();
      }
    },
    onError: (err: unknown) => {
      toast.error("Action failed", { description: getApiErrorMessage(err) });
    },
  });

  const recoveryMutation = useMutation({
    mutationFn: () => processRecovery(employer!.id),
    onSuccess: () => {
      toast.success("Settlement generated", {
        description: `Due recoveries for ${employer?.companyName} have been grouped into a settlement.`,
      });
      setRecoveryConfirm(false);
      onMutated();
    },
    onError: (err: unknown) => {
      toast.error("Settlement generation failed", { description: getApiErrorMessage(err) });
      setRecoveryConfirm(false);
    },
  });

  if (!open || !employer) return null;

  const isBusy        = mutation.isPending;
  const isRecovering  = recoveryMutation.isPending;
  const canActivate   = employer.status === "PENDING" || employer.status === "INACTIVE";
  const canReactivate = employer.status === "SUSPENDED";
  const canSuspend    = employer.status === "ACTIVE";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-[#E5E7EB] shadow-xl">
        {/* Header — same as EmployerDetailsDrawer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#111827] leading-none">{employer.companyName}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">{employer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[employer.status].cls}`}>
              {STATUS_BADGE[employer.status].label}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Company details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">
              Company details
            </p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Company code", v: <span className="font-mono">{employer.companyCode}</span> },
                { k: "Risk status",  v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${RISK_BADGE[employer.riskStatus]}`}>{employer.riskStatus}</span> },
                { k: "Member since", v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">
              Contact information
            </p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Contact person", v: employer.contactPerson },
                { k: "Email",          v: employer.email          },
                { k: "Phone",          v: employer.phone          },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Salary cycle */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">
              Salary cycle configuration
            </p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Salary date", v: `${employer.payrollDate}th of month`         },
                { k: "Cutoff date",  v: `${employer.payrollCutoffDate}th of month`   },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827]">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent salary requests */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">
              Recent salary requests
            </p>
            {reqLoading ? (
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="h-2 w-24 bg-[#F3F4F6] rounded animate-pulse" />
                    <div className="h-2 w-16 bg-[#F3F4F6] rounded animate-pulse ml-auto" />
                    <div className="h-4 w-14 bg-[#F3F4F6] rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="border border-[#E5E7EB] rounded-lg px-3 py-4 text-center">
                <p className="text-[11px] text-[#6B7280]">No salary requests found</p>
              </div>
            ) : (
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                {recentRequests.map(r => {
                  const cfg = SR_STATUS[r.status] ?? { label: r.status, cls: "bg-[#F3F4F6] text-[#6B7280]" };
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-[500] text-[#111827] truncate">{r.employee?.name ?? "—"}</p>
                        <p className="text-[11px] text-[#6B7280]">{r.employee?.employeeCode ?? ""}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-[500] text-[#6B7280] tabular-nums">
                          ₹{Number(r.amount ?? 0).toLocaleString("en-IN")}
                        </span>
                        <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Temp password banner — shown once when email delivery failed */}
        {tempPassword && (
          <div className="border-t border-amber-100 bg-amber-50 px-5 py-4 flex-shrink-0 space-y-3">
            <div className="flex items-start gap-2.5">
              <Mail size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-[600] text-amber-800">Email delivery failed</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Share this temporary password with the employer directly. It will not be shown again.
                </p>
              </div>
            </div>
            <div className="bg-white border border-amber-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-[600] text-[#6B7280] uppercase tracking-[0.06em]">Temporary password</p>
                <p className="text-[13px] font-[600] text-[#111827] font-mono mt-0.5 truncate">{tempPassword}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(tempPassword);
                  setCopiedPassword(true);
                  setTimeout(() => setCopiedPassword(false), 2000);
                }}
                title="Copy to clipboard"
                className="w-7 h-7 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0 transition-colors hover:border-[#E5E7EB]"
                style={copiedPassword ? { borderColor: "#6C4CFF", color: "#6C4CFF" } : { color: "#94a3b8" }}
              >
                <Copy size={12} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full h-8 rounded-lg bg-[#111827] hover:bg-[#111827] text-white text-[12px] font-[600] transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Footer — actions */}
        {!tempPassword && (canActivate || canReactivate || canSuspend) && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0 space-y-2.5">

            {/* Suspend confirm flow */}
            {canSuspend && suspendConfirm && (
              <div className="space-y-2.5">
                <p className="text-[12px] text-[#6B7280]">
                  Suspend <span className="font-[500] text-[#111827]">{employer.companyName}</span>? Employees will lose advance access.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuspendConfirm(false)}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md border border-[#E5E7EB] text-[12px] font-[500] text-[#6B7280] hover:bg-[#F8F9FC] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => mutation.mutate("SUSPENDED")}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-red-600 hover:bg-red-700 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                    Confirm suspend
                  </button>
                </div>
              </div>
            )}

          {/* Generate settlement confirm */}
          {recoveryConfirm && (
            <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-[12px] font-[600] text-amber-800 mb-1">Generate settlement?</p>
                <p className="text-[11px] text-amber-700 mb-3">
                  This will create a settlement for all due recoveries for <strong>{employer.companyName}</strong>.
                  The employer can then pay MobPae and admin can mark the settlement paid.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecoveryConfirm(false)}
                    disabled={isRecovering}
                    className="flex-1 h-7 rounded-md border border-amber-200 text-[11px] font-[500] text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => recoveryMutation.mutate()}
                    disabled={isRecovering}
                    className="flex-1 h-7 rounded-md bg-amber-600 hover:bg-amber-700 text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    {isRecovering ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    Generate
                  </button>
                </div>
              </div>
            )}

            {/* Normal action buttons */}
            {!suspendConfirm && (
              <div className="flex gap-2">
                {/* PENDING / INACTIVE → Activate */}
                {canActivate && (
                  <button
                    onClick={() => mutation.mutate("ACTIVE")}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-[#111827] hover:bg-[#111827] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    {isBusy ? "Activating…" : "Activate"}
                  </button>
                )}
                {/* SUSPENDED → Reactivate */}
                {canReactivate && (
                  <button
                    onClick={() => mutation.mutate("ACTIVE")}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-[#111827] hover:bg-[#111827] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {isBusy ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    {isBusy ? "Reactivating…" : "Reactivate"}
                  </button>
                )}
                {/* ACTIVE → Suspend */}
                {canSuspend && (
                  <button
                    onClick={() => setSuspendConfirm(true)}
                    disabled={isBusy}
                    className="h-8 px-3.5 rounded-md border border-[#E5E7EB] text-[12px] font-[500] text-[#6B7280] hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Ban size={12} />
                    Suspend
                  </button>
                )}
              </div>
            )}

            {/* Generate settlement — available for any active employer */}
            {!suspendConfirm && !recoveryConfirm && canSuspend && (
              <div className="mt-2">
                <button
                  onClick={() => setRecoveryConfirm(true)}
                  disabled={isBusy || isRecovering}
                  className="w-full h-8 rounded-md border border-[#E5E7EB] text-[12px] font-[500] text-[#6B7280] hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Generate Settlement
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
