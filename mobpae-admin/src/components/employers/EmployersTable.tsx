import type { Employer, EmployerStatus, EmployerRiskStatus } from "../../types/employer";

interface Props {
  employers: Employer[];
  selectedId: string | null;
  onSelect: (employer: Employer) => void;
}

const STATUS_BADGE: Record<EmployerStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-blue-50 text-blue-700",
  REJECTED: "bg-red-50 text-red-600",
  SUSPENDED: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<EmployerStatus, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

const RISK_BADGE: Record<EmployerRiskStatus, string> = {
  GOOD: "bg-green-50 text-green-700",
  WARNING: "bg-amber-50 text-amber-700",
  BLOCKED: "bg-red-50 text-red-600",
};

export default function EmployersTable({ employers, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[20px_1fr_90px_130px_80px_70px_64px_64px] gap-0 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
        {["", "Company", "Code", "Contact", "Payroll", "Risk", "Status", ""].map((h, i) => (
          <span key={i} className="text-[10px] font-[500] uppercase tracking-[0.05em] text-slate-400">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {employers.map((emp) => {
          const isSelected = selectedId === emp.id;
          return (
            <div
              key={emp.id}
              onClick={() => onSelect(emp)}
              className={`grid grid-cols-[20px_1fr_90px_130px_80px_70px_64px_64px] gap-0 px-4 py-3 border-b border-slate-50 last:border-0 items-center cursor-pointer transition-colors ${
                isSelected ? "bg-slate-50" : "hover:bg-slate-50/40"
              }`}
            >
              {/* Selection dot */}
              <div className={`w-[5px] h-[5px] rounded-full transition-colors ${isSelected ? "bg-blue-500" : "bg-transparent"}`} />

              {/* Company */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[11px] font-[600] flex-shrink-0">
                  {emp.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-[500] text-slate-800 leading-none truncate">{emp.companyName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate">{emp.email}</p>
                </div>
              </div>

              {/* Code */}
              <div>
                <span className="inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] bg-slate-100 text-slate-600 font-mono">
                  {emp.companyCode}
                </span>
              </div>

              {/* Contact */}
              <div className="min-w-0">
                <p className="text-[12px] font-[500] text-slate-700 leading-none truncate">{emp.contactPerson}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{emp.phone}</p>
              </div>

              {/* Payroll */}
              <div>
                <p className="text-[12px] text-slate-700 leading-none">{emp.payrollDate}th</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">cutoff {emp.payrollCutoffDate}th</p>
              </div>

              {/* Risk */}
              <div>
                <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${RISK_BADGE[emp.riskStatus]}`}>
                  {emp.riskStatus}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[emp.status]}`}>
                  {STATUS_LABEL[emp.status]}
                </span>
              </div>

              {/* Action */}
              <div className="text-right">
                <span className="text-[11px] text-slate-400">{isSelected ? "Close" : "Manage →"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[10px] text-slate-400">
          {employers.length} {employers.length === 1 ? "employer" : "employers"}
        </p>
      </div>
    </div>
  );
}
