import type { SalaryRequest, SalaryRequestStatus } from "../../types/salary-request";

interface Props {
  requests: SalaryRequest[];
  selectedId: string | null;
  onSelect: (r: SalaryRequest) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500",B:"bg-pink-500",C:"bg-fuchsia-500",D:"bg-[#ECEBFF]0",
  E:"bg-[#ECEBFF]0",F:"bg-[#ECEBFF]0",G:"bg-[#ECEBFF]0",H:"bg-sky-500",
  I:"bg-cyan-500",J:"bg-[#7679FF]",K:"bg-[#7679FF]",L:"bg-[#ECEBFF]0",
  M:"bg-lime-600",N:"bg-yellow-600",O:"bg-amber-500",P:"bg-orange-500",
  Q:"bg-red-500",R:"bg-rose-600",S:"bg-pink-600",T:"bg-fuchsia-600",
  U:"bg-[#7679FF]",V:"bg-[#7679FF]",W:"bg-[#7679FF]",X:"bg-[#7679FF]",
  Y:"bg-sky-600",Z:"bg-cyan-600",
};
const avatarBg = (n: string) => AVATAR_COLORS[n.charAt(0).toUpperCase()] ?? "bg-[#7679FF]";

const STATUS_CONFIG: Record<SalaryRequestStatus, { label: string; dot: string; text: string; bg: string }> = {
  SUBMITTED:           { label: "Submitted", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  EMPLOYER_APPROVED:   { label: "Emp Approved", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  EMPLOYER_REJECTED:   { label: "Rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  READY_FOR_DISBURSAL: { label: "Ready", dot: "bg-lime-500", text: "text-lime-700", bg: "bg-lime-50" },
  DISBURSED:           { label: "Disbursed", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REPAYMENT_SCHEDULED: { label: "Repayment", dot: "bg-[#D45F18]", text: "text-[#9A4910]", bg: "bg-[#FEF1E7]" },
  REPAID:              { label: "Repaid", dot: "bg-[#287A68]", text: "text-[#1A5944]", bg: "bg-[#D4EDE5]" },
};

const fmt = (v: string | null) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const TH = "px-4 py-2.5 text-left text-[11px] font-[600] uppercase tracking-[0.08em] text-[#62657A] whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function SalaryRequestsTable({ requests, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E4EF] overflow-hidden">
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
          <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]">
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
                className={`border-b border-[#F0F0F8] last:border-0 cursor-pointer transition-colors group ${
                  isSelected ? "bg-[#ECEBFF]/60" : "hover:bg-[#F7F7FB]/70"
                }`}
              >
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${avatarBg(req.employee.name)} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}>
                      {req.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-[#191A2E] leading-none truncate">{req.employee.name}</p>
                      <span className="font-mono text-[11px] text-[#62657A]">{req.employee.employeeCode}</span>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A] truncate">{req.employee.email}</p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#191A2E] truncate">{req.employee.employer.companyName}</p>
                  <span className="font-mono text-[11px] text-[#62657A]">{req.employee.employer.companyCode}</span>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[600] text-[#191A2E] tabular-nums">{fmt(req.amount)}</p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#62657A] tabular-nums">{fmt(req.approvedAmount)}</p>
                </td>
                <td className={TD}>
                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${s.bg} ${s.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A]">
                    {new Date(req.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </td>
                <td className={TD}>
                  <span className={`text-[11px] font-[500] ${isSelected ? "text-[#7679FF]" : "text-[#7679FF]"}`}>
                    {isSelected ? "Close" : "Review →"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-[#E4E4EF] bg-[#F7F7FB]/50">
        <p className="text-[11px] text-[#62657A]">{requests.length} {requests.length === 1 ? "request" : "requests"}</p>
      </div>
    </div>
  );
}
