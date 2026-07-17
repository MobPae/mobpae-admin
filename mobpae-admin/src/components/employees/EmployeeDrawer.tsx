import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { X, Mail } from "lucide-react";
import type { Employee } from "../../types/employee";
import { resendActivationEmail } from "../../services/employeeService";

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   "bg-success-bg text-success-dark",
  INACTIVE: "bg-surface-muted text-ink-3",
};

export default function EmployeeDrawer({ open, employee, onClose, onRefresh }: Props) {
  useEscKey(open, onClose);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg,     setResendMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  if (!open || !employee) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ink to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{employee.name}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[employee.employmentStatus]}`}>
              {employee.employmentStatus}
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
          {/* Personal */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Personal details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Full name", v: employee.name  },
                { k: "Email",     v: employee.email },
                { k: "Phone",     v: employee.phone },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employment */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Employment details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Employee code",  v: <span className="font-mono">{employee.employeeCode}</span> },
                { k: "Salary in hand", v: `₹${Number(employee.salaryInHand).toLocaleString("en-IN")}` },
                { k: "Joining date",   v: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set" },
                { k: "App access",     v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${employee.appActivated ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-surface-muted text-ink-3"}`}>{employee.appActivated ? "Enabled" : "Disabled"}</span> },
                { k: "Password set",   v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${employee.passwordChanged ? "bg-success-bg text-success-dark" : "bg-amber-50 text-amber-700"}`}>{employee.passwordChanged ? "Yes" : "Pending"}</span> },
                { k: "Member since",   v: new Date(employee.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
            {!employee.passwordChanged && (
              <div className="mt-2">
                {resendMsg && (
                  <p className={`mb-1.5 text-[11px] ${resendMsg.ok ? "text-success-dark" : "text-danger"}`}>
                    {resendMsg.text}
                  </p>
                )}
                <button
                  disabled={resendLoading}
                  onClick={async () => {
                    setResendLoading(true);
                    setResendMsg(null);
                    try {
                      await resendActivationEmail(employee.id);
                      setResendMsg({ ok: true, text: "Activation email sent successfully." });
                      onRefresh?.();
                    } catch {
                      setResendMsg({ ok: false, text: "Failed to send. Please try again." });
                    } finally {
                      setResendLoading(false);
                    }
                  }}
                  className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-edge bg-surface text-[12px] font-[500] text-ink-3 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail size={12} />
                  {resendLoading ? "Sending…" : "Resend activation email"}
                </button>
              </div>
            )}
          </section>

          {/* Employer */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Employer
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Company",      v: employee.employer.companyName },
                { k: "Company code", v: <span className="font-mono">{employee.employer.companyCode}</span> },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
