import { X } from "lucide-react";
import type { Repayment } from "../../types/repayment";

interface Props {
  open: boolean;
  repayment: Repayment | null;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  PAID:      "bg-emerald-50 text-emerald-700",
  OVERDUE:   "bg-red-50 text-red-600",
};

const fmt = (v: string) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function RepaymentDrawer({ open, repayment, onClose }: Props) {
  if (!open || !repayment) return null;

  const emp = repayment.salaryRequest.employee;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{emp.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{emp.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[repayment.status] ?? "bg-slate-100 text-slate-500"}`}>
              {repayment.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Repayment details */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Repayment details</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Principal amount", v: fmt(repayment.principalAmount) },
                { k: "Interest amount",  v: fmt(repayment.interestAmount)  },
                { k: "Total amount",     v: fmt(repayment.totalAmount)     },
                { k: "Interest rate",    v: `${repayment.interestRate}%`   },
                { k: "Interest days",    v: `${repayment.interestDays} days` },
                { k: "Due date",         v: new Date(repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(repayment.paidDate ? [{ k: "Paid on", v: new Date(repayment.paidDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(repayment.remarks ? [{ k: "Remarks", v: repayment.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Employee</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Name",          v: emp.name },
                { k: "Employee code", v: <span className="font-mono">{emp.employeeCode}</span> },
                { k: "Email",         v: emp.email },
                { k: "Employer",      v: emp.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Original salary request */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Salary request</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Request ID",       v: <span className="font-mono text-[10px]">{repayment.salaryRequestId}</span> },
                { k: "Advance amount",   v: fmt(repayment.salaryRequest.amount) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
