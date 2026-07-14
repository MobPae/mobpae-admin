import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Loader2, X } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { createEmployer } from "../../services/employerService";
import type { CreateEmployerPayload } from "../../types/employer";

export interface CreateEmployerPrefill {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  enquiryId?: string;   // if set, backend atomically links employer and sets enquiry status → ONBOARDED
}

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: CreateEmployerPrefill;
}

const EMPTY: CreateEmployerPayload = {
  companyName: "",
  companyCode: "",
  contactPerson: "",
  email: "",
  phone: "",
  payrollDate: 0,
  payrollCutoffDate: 0,
};

function validatePayrollDay(v: number): string | null {
  if (!Number.isInteger(v) || v < 1 || v > 31) return "Must be a whole number between 1 and 31";
  return null;
}

export default function CreateEmployerDrawer({ open, onClose, prefill }: Props) {
  useEscKey(open, onClose);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateEmployerPayload>(EMPTY);
  const [payrollDateErr, setPayrollDateErr]         = useState<string | null>(null);
  const [payrollCutoffErr, setPayrollCutoffErr]     = useState<string | null>(null);

  // Re-populate form whenever the drawer opens (with or without prefill)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm({
        companyName:      prefill?.companyName   ?? "",
        companyCode:      "",
        contactPerson:    prefill?.contactPerson ?? "",
        email:            prefill?.email         ?? "",
        phone:            prefill?.phone         ?? "",
        payrollDate:      0,
        payrollCutoffDate: 0,
      });
      setPayrollDateErr(null);
      setPayrollCutoffErr(null);
    }
  }

  const mutation = useMutation({
    mutationFn: createEmployer,
    onSuccess: () => {
      // Invalidate both lists — backend links enquiry + updates its status atomically
      void queryClient.invalidateQueries({ queryKey: ["employers"] });
      void queryClient.invalidateQueries({ queryKey: ["employer-enquiries"] });

      toast.success("Employer created", {
        description: `${form.companyName} has been added and is now listed.`,
      });
      handleClose();
    },
    onError: (err: unknown) => {
      toast.error("Failed to create employer", {
        description: getApiErrorMessage(err),
      });
    },
  });

  function handleClose() {
    setForm(EMPTY);
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pdErr  = validatePayrollDay(form.payrollDate);
    const pcdErr = validatePayrollDay(form.payrollCutoffDate);
    setPayrollDateErr(pdErr);
    setPayrollCutoffErr(pcdErr);
    if (pdErr || pcdErr) return;
    mutation.mutate({
      ...form,
      ...(prefill?.enquiryId ? { employerEnquiryId: prefill.enquiryId } : {}),
    });
  }

  const set =
    (k: keyof CreateEmployerPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setNum =
    (k: keyof CreateEmployerPayload, errSetter: (s: string | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setForm((prev) => ({ ...prev, [k]: v }));
      errSetter(validatePayrollDay(v));
    };

  const textsFilled =
    form.companyName.trim() !== "" &&
    form.companyCode.trim() !== "" &&
    form.contactPerson.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== "";
  const allFilled = textsFilled && form.payrollDate > 0 && form.payrollCutoffDate > 0;
  const isBusy = mutation.isPending;
  const hasPrefill = !!(prefill?.companyName || prefill?.email);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: "var(--color-brand)" }}
            >
              <Building2 size={13} />
            </div>
            <div>
              <p className="text-[13px] font-[600] text-ink">Create Employer</p>
              {hasPrefill && (
                <p className="text-[11px] text-ink-3 leading-none mt-0.5">Pre-filled from lead</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {hasPrefill && (
                <div className="bg-brand-soft border border-[#EEF2FF] rounded-lg px-4 py-3 text-[12px] text-[#2048EE] leading-relaxed">
                  Fields pre-filled from the lead. Add a Company Code to complete.
                </div>
              )}

              <FormField
                label="Company Name"
                value={form.companyName}
                onChange={set("companyName")}
                placeholder="e.g. XYZ Industries"
                required
              />
              <FormField
                label="Company Code"
                value={form.companyCode}
                onChange={set("companyCode")}
                placeholder="e.g. XYZ001"
                hint="Short unique identifier — used for employee references"
                required
              />
              <FormField
                label="Contact Person"
                value={form.contactPerson}
                onChange={set("contactPerson")}
                placeholder="Full name of HR or admin contact"
                required
              />
              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="contact@company.com"
                required
              />
              <FormField
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="10-digit mobile number"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormField
                    label="Salary date"
                    type="number"
                    value={form.payrollDate > 0 ? String(form.payrollDate) : ""}
                    onChange={setNum("payrollDate", setPayrollDateErr)}
                    placeholder="e.g. 25"
                    hint="Day of month (1–31)"
                    required
                  />
                  {payrollDateErr && (
                    <p className="text-[11px] text-danger mt-1">{payrollDateErr}</p>
                  )}
                </div>
                <div>
                  <FormField
                    label="Cutoff date"
                    type="number"
                    value={form.payrollCutoffDate > 0 ? String(form.payrollCutoffDate) : ""}
                    onChange={setNum("payrollCutoffDate", setPayrollCutoffErr)}
                    placeholder="e.g. 20"
                    hint="Day of month (1–31)"
                    required
                  />
                  {payrollCutoffErr && (
                    <p className="text-[11px] text-danger mt-1">{payrollCutoffErr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-edge px-5 py-3.5 flex-shrink-0 space-y-2.5">
              {mutation.isError && (
                <p className="text-[11px] text-danger font-[500]">
                  {getApiErrorMessage(mutation.error, "Failed to create employer. Please try again.")}
                </p>
              )}
              <button
                type="submit"
                disabled={isBusy || !allFilled}
                className="w-full h-9 rounded-lg text-white text-[13px] font-[600] flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                style={{ background: "var(--color-brand)" }}
                onMouseEnter={(e) => { if (!isBusy && allFilled) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-info)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-brand)"; }}
              >
                {isBusy && <Loader2 size={13} className="animate-spin" />}
                {isBusy ? "Creating…" : "Create Employer"}
              </button>
            </div>
          </form>
      </div>
    </>
  );
}

/* ── Sub-components ── */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-[600] text-ink-3 uppercase tracking-[0.06em] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-9 px-3 text-[13px] bg-white border border-edge rounded-lg text-ink placeholder-[#D1D5DB] outline-none transition-colors"
        style={{ boxShadow: "none" }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-brand)";
          e.target.style.boxShadow = "0 0 0 3px #EEF2FF";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "";
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && <p className="text-[11px] text-ink-3 mt-1">{hint}</p>}
    </div>
  );
}
