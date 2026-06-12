import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  User,
  Phone,
  Mail,
  Users,
  CalendarDays,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  approveEmployerEnquiry,
  rejectEmployerEnquiry,
} from "../../services/employerEnquiryService";
import type { EmployerEnquiry } from "../../types/employer-enquiry";

interface Props {
  open: boolean;
  onClose: () => void;
  onMutated?: () => void;
  employer: EmployerEnquiry | null;
}

interface ApproveForm {
  companyCode: string;
  payrollDate: string;
  payrollCutoffDate: string;
}

const INITIAL_FORM: ApproveForm = {
  companyCode: "",
  payrollDate: "",
  payrollCutoffDate: "",
};

export default function EmployerDetailsDrawer({
  open,
  onClose,
  onMutated,
  employer,
}: Props) {
  const [form, setForm] = useState<ApproveForm>(INITIAL_FORM);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  // Reset form when drawer opens with a new enquiry
  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setRejectConfirm(false);
    }
  }, [open, employer?.id]);

  const approveMutation = useMutation({
    mutationFn: () =>
      approveEmployerEnquiry(employer!.id, {
        companyCode: form.companyCode.trim().toUpperCase(),
        payrollDate: Number(form.payrollDate),
        payrollCutoffDate: Number(form.payrollCutoffDate),
      }),
    onSuccess: () => {
      toast.success("Employer approved", {
        description: `${employer?.companyName} has been onboarded. Login credentials sent to ${employer?.email}.`,
      });
      onMutated?.();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to approve employer";
      toast.error("Approval failed", { description: msg });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectEmployerEnquiry(employer!.id),
    onSuccess: () => {
      toast.success("Enquiry rejected", {
        description: `${employer?.companyName} has been marked as rejected.`,
      });
      onMutated?.();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to reject enquiry";
      toast.error("Rejection failed", { description: msg });
    },
  });

  if (!open || !employer) return null;

  const isPending = employer.status === "NEW" || employer.status === "CONTACTED";
  const isApproved = employer.status === "APPROVED";
  const isRejected = employer.status === "REJECTED";

  const canApprove = isPending;
  const canReject = isPending;

  const isApproveFormValid =
    form.companyCode.trim().length > 0 &&
    Number(form.payrollDate) >= 1 &&
    Number(form.payrollDate) <= 31 &&
    Number(form.payrollCutoffDate) >= 1 &&
    Number(form.payrollCutoffDate) <= 31;

  const handleApprove = () => {
    if (!isApproveFormValid) {
      toast.error("Validation error", {
        description: "Fill in company code and valid payroll dates (1–31).",
      });
      return;
    }
    approveMutation.mutate();
  };

  const handleReject = () => {
    if (!rejectConfirm) {
      setRejectConfirm(true);
      return;
    }
    rejectMutation.mutate();
  };

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">
                {employer.companyName}
              </h2>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isApproved
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : isRejected
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {employer.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Business Info */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Business Information
                </h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <InfoRow label="Company Name" value={employer.companyName} />
                <InfoRow
                  label="Est. Employees"
                  value={
                    employer.employeeCount != null
                      ? `${employer.employeeCount.toLocaleString("en-IN")} employees`
                      : "Not specified"
                  }
                />
                <InfoRow
                  label="Submitted"
                  value={new Date(employer.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                {employer.remarks && (
                  <InfoRow label="Remarks" value={employer.remarks} />
                )}
              </div>
            </section>

            {/* Contact Info */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact Details
                </h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Contact Person</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employer.contactPerson}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employer.phone}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Approval Form — only shown for pending enquiries */}
            {canApprove && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={14} className="text-slate-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Approval Configuration
                  </h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Company Code{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.companyCode}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          companyCode: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. ACME001"
                      maxLength={20}
                      className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Unique identifier assigned to this employer
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Payroll Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={form.payrollDate}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              payrollDate: e.target.value,
                            }))
                          }
                          placeholder="e.g. 28"
                          className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                        <Users
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Day of month (1–31)</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Payroll Cutoff{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={form.payrollCutoffDate}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            payrollCutoffDate: e.target.value,
                          }))
                        }
                        placeholder="e.g. 21"
                        className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Day of month (1–31)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-blue-700">
                      Approving will create an employer account and send login
                      credentials to <strong>{employer.email}</strong> with
                      password{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        MobPae@123
                      </code>
                      .
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {(canApprove || canReject) && (
          <div className="border-t border-slate-100 bg-white px-6 py-4">
            {rejectConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700 font-medium">
                  Confirm rejection of{" "}
                  <span className="text-slate-900">{employer.companyName}</span>
                  ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRejectConfirm(false)}
                    disabled={isBusy}
                    className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isBusy}
                    className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {canReject && (
                  <button
                    onClick={handleReject}
                    disabled={isBusy}
                    className="h-9 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                )}

                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={isBusy || !isApproveFormValid}
                    className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {approveMutation.isPending
                      ? "Approving…"
                      : "Approve Employer"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-500 shrink-0 w-32">{label}</span>
      <span className="text-xs font-medium text-slate-900 text-right">
        {value}
      </span>
    </div>
  );
}
