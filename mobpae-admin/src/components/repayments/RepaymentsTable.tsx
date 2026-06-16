import type { Repayment } from "../../types/repayment";

interface Props {
  repayments: Repayment[];
  selectedId: string | null;
  onSelect: (r: Repayment) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500",    B:"bg-pink-500",    C:"bg-fuchsia-500", D:"bg-blue-500",
  E:"bg-blue-500",  F:"bg-blue-500",  G:"bg-blue-500",    H:"bg-sky-500",
  I:"bg-cyan-500",    J:"bg-teal-500",    K:"bg-emerald-500", L:"bg-green-500",
  M:"bg-lime-500",    N:"bg-yellow-500",  O:"bg-amber-500",   P:"bg-orange-500",
  Q:"bg-red-500",     R:"bg-rose-600",    S:"bg-pink-600",    T:"bg-fuchsia-600",
  U:"bg-blue-600",  V:"bg-blue-600",  W:"bg-blue-600",  X:"bg-blue-600",
  Y:"bg-sky-600",     Z:"bg-cyan-600",
};

const STATUS_CONFIG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  SCHEDULED: { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50",    label: "Scheduled" },
  PAID:      { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", label: "Paid"      },
  OVERDUE:   { dot: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50",     label: "Overdue"   },
};

const fmt = (v: string) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function RepaymentsTable({ repayments, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "19%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "7%"  }} />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {["Employee","Email","Employer","Principal","Total","Status","Due date",""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {repayments.map(r => {
            const emp   = r.salaryRequest.employee;
            const first = emp.name.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-slate-500";
            const sc    = STATUS_CONFIG[r.status];
            const sel   = selectedId === r.id;
            return (
              <tr
                key={r.id}
                onClick={() => onSelect(r)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-blue-50/60" : "hover:bg-slate-50/80"}`}
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-slate-900 truncate leading-none">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">{emp.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-slate-500 truncate block">{emp.email}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-slate-700 truncate leading-none">{emp.employer.companyName}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-none">{emp.employer.companyCode}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-[600] text-slate-900 tabular-nums">{fmt(r.principalAmount)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-[600] text-slate-900 tabular-nums">{fmt(r.totalAmount)}</span>
                </td>
                <td className="px-4 py-3">
                  {sc && (
                    <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-[500] ${r.status === "OVERDUE" ? "text-red-600" : "text-slate-500"}`}>
                    {new Date(r.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-blue-600" : "text-blue-500 group-hover:text-blue-600"}`}>
                    View →
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
