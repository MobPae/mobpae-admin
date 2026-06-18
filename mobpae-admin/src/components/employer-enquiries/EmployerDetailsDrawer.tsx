import { X, Building2, CheckCircle2 } from "lucide-react";
import type { EmployerEnquiry } from "../../types/employer-enquiry";

interface Props {
  open: boolean;
  onClose: () => void;
  employer: EmployerEnquiry | null;
  onCreateEmployer: (enquiry: EmployerEnquiry) => void;
}

const STATUS_CONFIG: Record<string, { cls: string; label: string }> = {
  NEW:       { cls: "bg-amber-50 text-amber-700",     label: "New"       },
  CONTACTED: { cls: "bg-blue-50 text-blue-700",       label: "Contacted" },
  APPROVED:  { cls: "bg-emerald-50 text-emerald-700", label: "Onboarded" },
  ONBOARDED: { cls: "bg-emerald-50 text-emerald-700", label: "Onboarded" },
  REJECTED:  { cls: "bg-red-50 text-red-600",         label: "Rejected"  },
};

export default function EmployerDetailsDrawer({ open, onClose, employer, onCreateEmployer }: Props) {
  if (!open || !employer) return null;

  const statusCfg = STATUS_CONFIG[employer.status] ?? { cls: "bg-slate-100 text-slate-500", label: employer.status };
  const isOnboarded = employer.status === "ONBOARDED" || employer.status === "APPROVED";

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
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${statusCfg.cls}`}>
              {statusCfg.label}
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
              Lead details
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Contact person", v: employer.contactPerson },
                { k: "Email",          v: employer.email         },
                { k: "Phone",          v: employer.phone         },
                { k: "Est. employees", v: employer.employeeCount != null ? employer.employeeCount.toLocaleString("en-IN") : "Not specified" },
                { k: "Submitted",      v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(employer.remarks ? [{ k: "Remarks", v: employer.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Status note */}
          {isOnboarded ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-3">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                This company has been onboarded. Their employer account is active in the{" "}
                <span className="font-[600]">Employers</span> module.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Create an employer account using the lead details above. The form will be pre-filled for you.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0">
          {isOnboarded ? (
            <div className="flex items-center justify-center gap-2 h-8 text-[12px] font-[500] text-emerald-600">
              <CheckCircle2 size={13} />
              Onboarding complete
            </div>
          ) : (
            <button
              onClick={() => { onClose(); onCreateEmployer(employer); }}
              className="w-full h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Building2 size={13} />
              Create Employer
            </button>
          )}
        </div>
      </div>
    </>
  );
}
