import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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

const INIT: ApproveForm = { companyCode: "", payrollDate: "", payrollCutoffDate: "" };

export default function EmployerDetailsDrawer({ open, onClose, onMutated, employer }: Props) {
  const [form, setForm] = useState<ApproveForm>(INIT);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(INIT);
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
        description: `${employer?.companyName} onboarded. Credentials sent to ${employer?.email}.`,
      });
      onMutated?.();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Approval failed", {
        description: err instanceof Error ? err.message : "Unexpected error",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectEmployerEnquiry(employer!.id),
    onSuccess: () => {
      toast.success("Enquiry rejected");
      onMutated?.();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", {
        description: err instanceof Error ? err.message : "Unexpected error",
      });
    },
  });

  if (!open || !employer) return null;

  const isPending = employer.status === "NEW" || employer.status === "CONTACTED";
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const isFormValid =
    form.companyCode.trim().length >= 2 &&
    Number(form.payrollDate) >= 1 &&
    Number(form.payrollDate) <= 31 &&
    Number(form.payrollCutoffDate) >= 1 &&
    Number(form.payrollCutoffDate) <= 31;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
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
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${
              employer.status === "APPROVED" ? "bg-green-50 text-green-700" :
              employer.status === "REJECTED" ? "bg-red-50 text-red-600" :
              "bg-amber-50 text-amber-700"
            }`}>
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
                { k: "Contact person", v: employer.contactPerson },
                { k: "Phone", v: employer.phone },
                { k: "Est. employees", v: employer.employeeCount != null ? `${employer.employeeCount.toLocaleString("en-IN")}` : "Not specified" },
                { k: "Submitted", v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(employer.remarks ? [{ k: "Remarks", v: employer.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Approval config — only for pending */}
          {isPending && (
            <section>
              <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
                Approval configuration
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">
                    Company code <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.companyCode}
                    onChange={(e) => setForm((f) => ({ ...f, companyCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. INFOSYS001"
                    maxLength={20}
                    className="w-full h-8 px-3 text-[12px] font-mono bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1.5">
                      Payroll date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.payrollDate}
                      onChange={(e) => setForm((f) => ({ ...f, payrollDate: e.target.value }))}
                      placeholder="28"
                      className="w-full h-8 px-3 text-[12px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1.5">
                      Cutoff date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={form.payrollCutoffDate}
                      onChange={(e) => setForm((f) => ({ ...f, payrollCutoffDate: e.target.value }))}
                      placeholder="21"
                      className="w-full h-8 px-3 text-[12px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-md px-3 py-2.5 border border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Approving creates an employer account. Default password{" "}
                    <code className="bg-slate-200 px-1 rounded text-[10px] text-slate-700">MobPae@123</code>{" "}
                    sent to <span className="text-slate-700 font-[500]">{employer.email}</span>.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        {isPending && (
          <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0">
            {rejectConfirm ? (
              <div className="space-y-2.5">
                <p className="text-[12px] text-slate-600">
                  Reject <span className="font-[500] text-slate-800">{employer.companyName}</span>?
                  This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRejectConfirm(false)}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md border border-slate-200 text-[12px] font-[500] text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate()}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-red-600 hover:bg-red-700 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Confirm reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setRejectConfirm(true)}
                  disabled={isBusy}
                  className="h-8 px-3.5 rounded-md border border-slate-200 text-[12px] font-[500] text-slate-500 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle size={12} />
                  Reject
                </button>
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={isBusy || !isFormValid}
                  className="flex-1 h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {approveMutation.isPending
                    ? <Loader2 size={12} className="animate-spin" />
                    : <CheckCircle2 size={12} />}
                  {approveMutation.isPending ? "Approving…" : "Approve employer"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
