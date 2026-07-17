import type { KycEmployeeGroup } from "../../types/kyc";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  groups: KycEmployeeGroup[];
  selectedId: string | null;
  onSelect: (g: KycEmployeeGroup) => void;
}

const OVERALL_STATUS: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:       { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  VERIFIED:      { label: "Verified", dot: "bg-[#22C55E]", text: "text-success-dark", bg: "bg-success-bg" },
  REJECTED:      { label: "Rejected", dot: "bg-red-400", text: "text-danger", bg: "bg-danger-soft" },
  NOT_SUBMITTED: { label: "Not submitted", dot: "bg-ink-4", text: "text-ink-3", bg: "bg-surface-muted" },
};

export default function KycGroupedTable({ groups, selectedId, onSelect }: Props) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
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
          <tr className="border-b border-edge bg-canvas/60">
            {["Employee", "Employer", "Submitted", "Pending", "Verified", "Rejected", "Overall status", "Docs", ""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-ink-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-2">
          {groups.map(g => {
            const first = g.employeeName.charAt(0).toUpperCase();
            const av    = avatarColor(g.employeeName);
            const sc    = OVERALL_STATUS[g.overallStatus] ?? OVERALL_STATUS.NOT_SUBMITTED;
            const sel   = selectedId === g.employeeId;
            return (
              <tr
                key={g.employeeId}
                onClick={() => onSelect(g)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-brand-soft/60" : "hover:bg-canvas/80"}`}
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]" style={{ background: av }}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-ink truncate leading-none">{g.employeeName}</p>
                      <p className="text-[11px] text-ink-3 font-mono mt-0.5 leading-none">{g.employeeCode}</p>
                    </div>
                  </div>
                </td>
                {/* Employer */}
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-ink-3 truncate leading-none">{g.companyName}</p>
                </td>
                {/* Count cells */}
                <td className="px-4 py-3">
                  <span className="text-[13px] font-[600] text-ink-3 tabular-nums">{g.submittedCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.pendingCount > 0 ? "text-warning" : "text-ink-3"}`}>
                    {g.pendingCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.verifiedCount > 0 ? "text-brand" : "text-ink-3"}`}>
                    {g.verifiedCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.rejectedCount > 0 ? "text-danger" : "text-ink-3"}`}>
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
                  <span className="text-[11px] text-ink-3 font-[500]">
                    {g.documents.length} / 3
                  </span>
                </td>
                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-brand" : "text-ink-3 group-hover:text-brand"}`}>
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
