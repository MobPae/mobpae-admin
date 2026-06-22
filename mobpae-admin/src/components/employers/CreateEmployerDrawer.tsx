import { useEscKey } from "../../lib/useEscKey";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, CheckCircle2, Copy, Loader2, X } from "lucide-react";
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
  const [credentials, setCredentials] = useState<{
    loginEmail?: string;
    temporaryPassword?: string;
    companyName: string;
  } | null>(null);

  // Re-populate form whenever the drawer opens (with or without prefill)
  useEffect(() => {
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
      setCredentials(null);
    }
  }, [open, prefill]);

  const mutation = useMutation({
    mutationFn: createEmployer,
    onSuccess: (data) => {
      // Invalidate both lists — backend links enquiry + updates its status atomically
      void queryClient.invalidateQueries({ queryKey: ["employers"] });
      void queryClient.invalidateQueries({ queryKey: ["employer-enquiries"] });

      if (data.loginEmail || data.temporaryPassword) {
        setCredentials({
          loginEmail: data.loginEmail,
          temporaryPassword: data.temporaryPassword,
          companyName: data.companyName,
        });
      } else {
        toast.success("Employer created", {
          description: `${form.companyName} has been added and is now listed.`,
        });
        handleClose();
      }
    },
    onError: (err: unknown) => {
      toast.error("Failed to create employer", {
        description: getApiErrorMessage(err),
      });
    },
  });

  function handleClose() {
    setForm(EMPTY);
    setCredentials(null);
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
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 flex flex-col border-l border-[#E4E4EF] shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E4EF] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: "#7679FF" }}
            >
              <Building2 size={13} />
            </div>
            <div>
              <p className="text-[13px] font-[600] text-[#191A2E]">Create Employer</p>
              {hasPrefill && (
                <p className="text-[11px] text-[#62657A] leading-none mt-0.5">Pre-filled from lead</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[#62657A] hover:text-[#62657A] hover:bg-[#F0F0F8] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Credentials success view ── */}
        {credentials ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ECEBFF] flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-[#7679FF]" />
            </div>
            <h2 className="text-[17px] font-[700] text-[#191A2E] tracking-tight mb-1">
              Employer Created
            </h2>
            <p className="text-[12px] text-[#62657A] mb-1">{credentials.companyName}</p>
            <p className="text-[12px] text-[#62657A] mb-7">
              Share these login credentials with the employer
            </p>

            <div className="w-full space-y-2.5 text-left">
              {credentials.loginEmail && (
                <CredRow label="Login Email" value={credentials.loginEmail} />
              )}
              {credentials.temporaryPassword && (
                <CredRow label="Temporary Password" value={credentials.temporaryPassword} />
              )}
            </div>

            <div
              className="w-full mt-5 rounded-lg px-4 py-3 text-left"
              style={{ background: "#ECEBFF", border: "1px solid #C8C9FF" }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: "#5659D9" }}>
                Status is <strong>PENDING</strong> by default. Go to{" "}
                <strong>Employers</strong> and click <strong>Activate</strong> to allow employee logins.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-5 w-full h-9 rounded-lg bg-[#191A2E] hover:bg-[#191A2E] text-white text-[13px] font-[600] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Create form ── */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {hasPrefill && (
                <div className="bg-[#ECEBFF] border border-[#ECEBFF] rounded-lg px-4 py-3 text-[12px] text-[#5659D9] leading-relaxed">
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
                    label="Payroll date"
                    type="number"
                    value={form.payrollDate > 0 ? String(form.payrollDate) : ""}
                    onChange={setNum("payrollDate", setPayrollDateErr)}
                    placeholder="e.g. 25"
                    hint="Day of month (1–31)"
                    required
                  />
                  {payrollDateErr && (
                    <p className="text-[11px] text-red-600 mt-1">{payrollDateErr}</p>
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
                    <p className="text-[11px] text-red-600 mt-1">{payrollCutoffErr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E4E4EF] px-5 py-3.5 flex-shrink-0 space-y-2.5">
              {mutation.isError && (
                <p className="text-[11px] text-red-600 font-[500]">
                  {getApiErrorMessage(mutation.error, "Failed to create employer. Please try again.")}
                </p>
              )}
              <button
                type="submit"
                disabled={isBusy || !allFilled}
                className="w-full h-9 rounded-lg text-white text-[13px] font-[600] flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                style={{ background: "#7679FF" }}
                onMouseEnter={(e) => { if (!isBusy && allFilled) (e.currentTarget as HTMLButtonElement).style.background = "#5659D9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#7679FF"; }}
              >
                {isBusy && <Loader2 size={13} className="animate-spin" />}
                {isBusy ? "Creating…" : "Create Employer"}
              </button>
            </div>
          </form>
        )}
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
      <label className="block text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.06em] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-9 px-3 text-[13px] bg-white border border-[#E4E4EF] rounded-lg text-[#191A2E] placeholder-[#B7B9C7] outline-none transition-colors"
        style={{ boxShadow: "none" }}
        onFocus={(e) => {
          e.target.style.borderColor = "#7679FF";
          e.target.style.boxShadow = "0 0 0 3px #ECEBFF";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "";
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && <p className="text-[11px] text-[#62657A] mt-1">{hint}</p>}
    </div>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#F7F7FB] border border-[#E4E4EF] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.06em]">{label}</p>
        <p className="text-[13px] font-[600] text-[#191A2E] font-mono mt-0.5 truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        title="Copy to clipboard"
        className="w-7 h-7 rounded-md bg-white border border-[#E4E4EF] flex items-center justify-center flex-shrink-0 transition-colors hover:border-[#E4E4EF]"
        style={copied ? { borderColor: "#7679FF", color: "#7679FF" } : { color: "#94a3b8" }}
      >
        <Copy size={12} />
      </button>
    </div>
  );
}
