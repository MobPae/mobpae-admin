import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { updateEmployerStatus } from "../../services/employerService";
import type { Employer } from "../../types/employer";

interface Props {
  open: boolean;
  onClose: () => void;
  onMutated: () => void;
  employer: Employer | null;
}

const STATUS_BADGE: Record<Employer["status"], string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  APPROVED:  "bg-blue-50 text-blue-700",
  REJECTED:  "bg-red-50 text-red-600",
  SUSPENDED: "bg-orange-50 text-orange-600",
};

const RISK_BADGE: Record<Employer["riskStatus"], string> = {
  GOOD:    "bg-emerald-50 text-emerald-700",
  WARNING: "bg-amber-50 text-amber-700",
  BLOCKED: "bg-red-50 text-red-600",
};

export default function EmployerManagementDrawer({ open, onClose, onMutated, employer }: Props) {
  const [suspendConfirm, setSuspendConfirm] = useState(false);

  useEffect(() => {
    if (open) setSuspendConfirm(false);
  }, [open, employer?.id]);

  const mutation = useMutation({
    mutationFn: (status: Employer["status"]) => updateEmployerStatus(employer!.id, status),
    onSuccess: (_data, status) => {
      toast.success(status === "SUSPENDED" ? "Employer suspended" : "Employer activated", {
        description: status === "SUSPENDED"
          ? `${employer?.companyName} has been suspended.`
          : `${employer?.companyName} is now active.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Action failed", {
        description: err instanceof Error ? err.message : "Unexpected error",
      });
    },
  });

  if (!open || !employer) return null;

  const isBusy = mutation.isPending;
  const canSuspend = employer.status === "ACTIVE";
  const canActivate = employer.status === "SUSPENDED" || employer.status === "PENDING";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header — same as EmployerDetailsDrawer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{employer.companyName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{employer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[employer.status]}`}>
              {employer.status}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Company details */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Company details
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Company code", v: <span className="font-mono">{employer.companyCode}</span> },
                { k: "Risk status",  v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${RISK_BADGE[employer.riskStatus]}`}>{employer.riskStatus}</span> },
                { k: "Member since", v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Contact information
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Contact person", v: employer.contactPerson },
                { k: "Email",          v: employer.email          },
                { k: "Phone",          v: employer.phone          },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Payroll */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Payroll configuration
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Payroll date", v: `${employer.payrollDate}th of month`         },
                { k: "Cutoff date",  v: `${employer.payrollCutoffDate}th of month`   },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer — actions */}
        {(canSuspend || canActivate) && (
          <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0">
            {canSuspend && (
              suspendConfirm ? (
                <div className="space-y-2.5">
                  <p className="text-[12px] text-slate-600">
                    Suspend <span className="font-[500] text-slate-800">{employer.companyName}</span>? Employees will lose advance access.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSuspendConfirm(false)}
                      disabled={isBusy}
                      className="flex-1 h-8 rounded-md border border-slate-200 text-[12px] font-[500] text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuspendConfirm(true)}
                    disabled={isBusy}
                    className="h-8 px-3.5 rounded-md border border-slate-200 text-[12px] font-[500] text-slate-500 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Ban size={12} />
                    Suspend
                  </button>
                </div>
              )
            )}
            {canActivate && (
              <button
                onClick={() => mutation.mutate("ACTIVE")}
                disabled={isBusy}
                className="w-full h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                {isBusy ? "Activating…" : "Activate employer"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
