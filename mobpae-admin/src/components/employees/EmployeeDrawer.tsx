import { X } from "lucide-react";
import type { Employee } from "../../types/employee";

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-red-50 text-red-600",
};

export default function EmployeeDrawer({ open, employee, onClose }: Props) {
  if (!open || !employee) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{employee.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[employee.employmentStatus]}`}>
              {employee.employmentStatus}
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
          {/* Personal */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Personal details
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Full name",  v: employee.name             },
                { k: "Email",      v: employee.email            },
                { k: "Phone",      v: employee.phone            },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employment */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Employment details
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Employee code",  v: <span className="font-mono">{employee.employeeCode}</span> },
                { k: "Salary in hand", v: `₹${Number(employee.salaryInHand).toLocaleString("en-IN")}` },
                { k: "Joining date",   v: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set" },
                { k: "App access",     v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${employee.appActivated ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{employee.appActivated ? "Enabled" : "Disabled"}</span> },
                { k: "Member since",   v: new Date(employee.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employer */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">
              Employer
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Company",      v: employee.employer.companyName },
                { k: "Company code", v: <span className="font-mono">{employee.employer.companyCode}</span> },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
