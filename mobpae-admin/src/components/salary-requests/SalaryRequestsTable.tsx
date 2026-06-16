import type { SalaryRequest, SalaryRequestStatus } from "../../types/salary-request";

interface Props {
  requests: SalaryRequest[];
  selectedId: string | null;
  onSelect: (r: SalaryRequest) => void;
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

const STATUS_CONFIG: Record<SalaryRequestStatus, { label: string; dot: string; text: string; bg: string }> = {
  SUBMITTED:           { label: "Submitted",    dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  EMPLOYER_APPROVED:   { label: "Emp Approved", dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  EMPLOYER_REJECTED:   { label: "Rejected",     dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50"     },
  READY_FOR_DISBURSAL: { label: "Ready",        dot: "bg-blue-400",  text: "text-blue-700",  bg: "bg-blue-50"  },
  DISBURSED:           { label: "Disbursed",    dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  REPAYMENT_SCHEDULED: { label: "Repayment",    dot: "bg-blue-400",  text: "text-blue-700",  bg: "bg-blue-50"  },
  REPAID:              { label: "Repaid",        dot: "bg-slate-300",   text: "text-slate-500",   bg: "bg-slate-100"  },
};

const fmt = (v: string | null) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const TH = "px-4 py-2.5 text-left text-[10px] font-[600] uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function SalaryRequestsTable({ requests, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "7%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className={TH}>Employee</th>
            <th className={TH}>Email</th>
            <th className={TH}>Company</th>
            <th className={TH}>Amount</th>
            <th className={TH}>Approved</th>
            <th className={TH}>Status</th>
            <th className={TH}>Requested</th>
            <th className={TH}></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const isSelected = selectedId === req.id;
            const s = STATUS_CONFIG[req.status];
            return (
              <tr
                key={req.id}
                onClick={() => onSelect(req)}
                className={`border-b border-slate-50 last:border-0 cursor-pointer transition-colors group ${
                  isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                }`}
              >
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${avatarBg(req.employee.name)} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}>
                      {req.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-slate-900 leading-none truncate">{req.employee.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{req.employee.employeeCode}</span>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-slate-600 truncate">{req.employee.email}</p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-slate-800 truncate">{req.employee.employer.companyName}</p>
                  <span className="font-mono text-[10px] text-slate-400">{req.employee.employer.companyCode}</span>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[600] text-slate-900 tabular-nums">{fmt(req.amount)}</p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-slate-700 tabular-nums">{fmt(req.approvedAmount)}</p>
                </td>
                <td className={TD}>
                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${s.bg} ${s.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-slate-500">
                    {new Date(req.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </td>
                <td className={TD}>
                  <span className={`text-[11px] font-[500] ${isSelected ? "text-blue-600" : "text-blue-500"}`}>
                    {isSelected ? "Close" : "Review →"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400">{requests.length} {requests.length === 1 ? "request" : "requests"}</p>
      </div>
    </div>
  );
}
