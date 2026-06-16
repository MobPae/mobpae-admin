import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, CheckCircle2, Copy, Loader2, X } from "lucide-react";
import { createEmployer } from "../../services/employerService";
import type { CreateEmployerPayload } from "../../types/employer";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY: CreateEmployerPayload = {
  companyName: "",
  companyCode: "",
  contactPerson: "",
  email: "",
  phone: "",
};

export default function CreateEmployerDrawer({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateEmployerPayload>(EMPTY);
  const [credentials, setCredentials] = useState<{
    loginEmail?: string;
    temporaryPassword?: string;
    companyName: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: createEmployer,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["employers"] });
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
        description: err instanceof Error ? err.message : "Unexpected error occurred",
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
    mutation.mutate(form);
  }

  const set =
    (k: keyof CreateEmployerPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const allFilled = Object.values(form).every((v) => v.trim() !== "");
  const isBusy = mutation.isPending;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: "#c4522a" }}
            >
              <Building2 size={13} />
            </div>
            <p className="text-[13px] font-[600] text-slate-900">Create Employer</p>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Credentials success view ── */}
        {credentials ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-[17px] font-[700] text-slate-900 tracking-tight mb-1">
              Employer Created
            </h2>
            <p className="text-[12px] text-slate-400 mb-1">
              {credentials.companyName}
            </p>
            <p className="text-[12px] text-slate-400 mb-7">
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
              style={{ background: "#fdf3ee", border: "1px solid #fde8d8" }}
            >
              <p className="text-[11px] leading-relaxed" style={{ color: "#a8411f" }}>
                Status is <strong>PENDING</strong> by default. Open the employer record and click{" "}
                <strong>Activate</strong> to allow employee logins.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-5 w-full h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-[600] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Create form ── */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-[12px] text-slate-500 leading-relaxed">
                Creates a new employer account directly. The employer can log in immediately if activated.
              </div>

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
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0 space-y-2.5">
              {mutation.isError && (
                <p className="text-[11px] text-red-600 font-[500]">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Failed to create employer. Please try again."}
                </p>
              )}
              <button
                type="submit"
                disabled={isBusy || !allFilled}
                className="w-full h-9 rounded-lg text-white text-[13px] font-[600] flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                style={{ background: "#c4522a" }}
                onMouseEnter={(e) => { if (!isBusy && allFilled) (e.currentTarget as HTMLButtonElement).style.background = "#a8411f"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c4522a"; }}
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
      <label className="block text-[11px] font-[600] text-slate-500 uppercase tracking-[0.06em] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-300 outline-none transition-colors"
        style={{ boxShadow: "none" }}
        onFocus={(e) => {
          e.target.style.borderColor = "#c4522a";
          e.target.style.boxShadow = "0 0 0 3px #fdf3ee";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "";
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
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
    <div className="bg-slate-50 border border-slate-100 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-[600] text-slate-400 uppercase tracking-[0.06em]">{label}</p>
        <p className="text-[13px] font-[600] text-slate-900 font-mono mt-0.5 truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        title="Copy to clipboard"
        className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 transition-colors hover:border-slate-300"
        style={copied ? { borderColor: "#c4522a", color: "#c4522a" } : { color: "#94a3b8" }}
      >
        <Copy size={12} />
      </button>
    </div>
  );
}
