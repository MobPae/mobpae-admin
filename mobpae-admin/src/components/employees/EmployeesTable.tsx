import type { Employee, EmploymentStatus } from "../../types/employee";

interface Props {
  employees: Employee[];
  selectedId: string | null;
  onSelect: (employee: Employee) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500",B:"bg-pink-500",C:"bg-fuchsia-500",D:"bg-blue-500",
  E:"bg-blue-500",F:"bg-blue-500",G:"bg-blue-500",H:"bg-sky-500",
  I:"bg-cyan-500",J:"bg-teal-500",K:"bg-emerald-500",L:"bg-green-500",
  M:"bg-lime-600",N:"bg-yellow-600",O:"bg-amber-500",P:"bg-orange-500",
  Q:"bg-red-500",R:"bg-rose-600",S:"bg-pink-600",T:"bg-fuchsia-600",
  U:"bg-blue-600",V:"bg-blue-600",W:"bg-blue-600",X:"bg-blue-600",
  Y:"bg-sky-600",Z:"bg-cyan-600",
};
const avatarBg = (n: string) => AVATAR_COLORS[n.charAt(0).toUpperCase()] ?? "bg-slate-600";

const STATUS_CONFIG: Record<EmploymentStatus, { label: string; dot: string; text: string; bg: string }> = {
  ACTIVE:   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  INACTIVE: { label: "Inactive", dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
};

const TH = "px-4 py-2.5 text-left text-[10px] font-[600] uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function EmployeesTable({ employees, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "16%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "7%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className={TH}>Employee</th>
            <th className={TH}>Email</th>
            <th className={TH}>Phone</th>
            <th className={TH}>Employer</th>
            <th className={TH}>Salary</th>
            <th className={TH}>Status</th>
            <th className={TH}>App</th>
            <th className={TH}></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const isSelected = selectedId === emp.id;
            const s = STATUS_CONFIG[emp.employmentStatus];
            return (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`border-b border-slate-50 last:border-0 cursor-pointer transition-colors group ${
                  isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Employee */}
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${avatarBg(emp.name)} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-slate-900 leading-none truncate">{emp.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{emp.employeeCode}</span>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className={TD}>
                  <p className="text-[12px] text-slate-600 truncate">{emp.email}</p>
                </td>

                {/* Phone */}
                <td className={TD}>
                  <p className="text-[12px] text-slate-600 font-mono">{emp.phone}</p>
                </td>

                {/* Employer */}
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-slate-800 truncate">{emp.employer.companyName}</p>
                  <span className="font-mono text-[10px] text-slate-400">{emp.employer.companyCode}</span>
                </td>

                {/* Salary */}
                <td className={TD}>
                  <p className="text-[12px] font-[600] text-slate-900 tabular-nums">
                    ₹{Number(emp.salaryInHand).toLocaleString("en-IN")}
                  </p>
                </td>

                {/* Status */}
                <td className={TD}>
                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${s.bg} ${s.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${s.dot}`} />
                    {s.label}
                  </span>
                </td>

                {/* App activated */}
                <td className={TD}>
                  {emp.appActivated
                    ? <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] bg-blue-50 text-blue-700"><span className="w-[6px] h-[6px] rounded-full bg-blue-400 flex-shrink-0" />On</span>
                    : <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] bg-slate-100 text-slate-400"><span className="w-[6px] h-[6px] rounded-full bg-slate-300 flex-shrink-0" />Off</span>
                  }
                </td>

                {/* Action */}
                <td className={TD}>
                  <span className={`text-[11px] font-[500] ${isSelected ? "text-blue-600" : "text-blue-500"}`}>
                    {isSelected ? "Close" : "View →"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400">{employees.length} {employees.length === 1 ? "employee" : "employees"}</p>
      </div>
    </div>
  );
}
