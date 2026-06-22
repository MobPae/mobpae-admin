import type { KycEmployeeGroup } from "../../types/kyc";

interface Props {
  groups: KycEmployeeGroup[];
  selectedId: string | null;
  onSelect: (g: KycEmployeeGroup) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500", B:"bg-pink-500", C:"bg-fuchsia-500", D:"bg-[#ECEBFF]0",
  E:"bg-indigo-500", F:"bg-violet-500", G:"bg-purple-500", H:"bg-sky-500",
  I:"bg-cyan-500", J:"bg-[#7679FF]", K:"bg-[#7679FF]", L:"bg-[#ECEBFF]0",
  M:"bg-lime-500", N:"bg-yellow-500", O:"bg-amber-500", P:"bg-orange-500",
  Q:"bg-red-500", R:"bg-rose-600", S:"bg-pink-600", T:"bg-fuchsia-600",
  U:"bg-[#7679FF]", V:"bg-indigo-600", W:"bg-violet-600", X:"bg-[#7679FF]",
  Y:"bg-sky-600", Z:"bg-cyan-600",
};

const OVERALL_STATUS: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:       { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  VERIFIED:      { label: "Verified", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REJECTED:      { label: "Rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  NOT_SUBMITTED: { label: "Not submitted", dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" },
};

export default function KycGroupedTable({ groups, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%"  }} />
          <col style={{ width: "9%"  }} />
          <col style={{ width: "9%"  }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "8%"  }} />
          <col style={{ width: "5%"  }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]/60">
            {["Employee", "Employer", "Submitted", "Pending", "Verified", "Rejected", "Overall status", "Docs", ""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F0F8]">
          {groups.map(g => {
            const first = g.employeeName.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-[#F7F7FB]0";
            const sc    = OVERALL_STATUS[g.overallStatus] ?? OVERALL_STATUS.NOT_SUBMITTED;
            const sel   = selectedId === g.employeeId;
            return (
              <tr
                key={g.employeeId}
                onClick={() => onSelect(g)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-[#ECEBFF]/60" : "hover:bg-[#F7F7FB]/80"}`}
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-[#191A2E] truncate leading-none">{g.employeeName}</p>
                      <p className="text-[11px] text-[#62657A] font-mono mt-0.5 leading-none">{g.employeeCode}</p>
                    </div>
                  </div>
                </td>
                {/* Employer */}
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-[#62657A] truncate leading-none">{g.companyName}</p>
                </td>
                {/* Count cells */}
                <td className="px-4 py-3">
                  <span className="text-[13px] font-[600] text-[#62657A] tabular-nums">{g.submittedCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.pendingCount > 0 ? "text-amber-600" : "text-[#62657A]"}`}>
                    {g.pendingCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.verifiedCount > 0 ? "text-[#7679FF]" : "text-[#62657A]"}`}>
                    {g.verifiedCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.rejectedCount > 0 ? "text-red-500" : "text-[#62657A]"}`}>
                    {g.rejectedCount}
                  </span>
                </td>
                {/* Overall status */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </td>
                {/* Doc count chips */}
                <td className="px-4 py-3">
                  <span className="text-[11px] text-[#62657A] font-[500]">
                    {g.documents.length} / 3
                  </span>
                </td>
                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-[#7679FF]" : "text-[#62657A] group-hover:text-[#7679FF]"}`}>
                    →
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
