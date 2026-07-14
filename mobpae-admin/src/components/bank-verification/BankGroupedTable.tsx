import type { BankEmployerGroup } from "../../types/bankAccount";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  groups: BankEmployerGroup[];
  selectedId: string | null;
  onSelect: (g: BankEmployerGroup) => void;
}

export default function BankGroupedTable({ groups, selectedId, onSelect }: Props) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "8%"  }} />
        </colgroup>
        <thead>
          <tr className="border-b border-edge bg-canvas/60">
            {["Employer", "Total", "Pending", "Verified", "Status breakdown", ""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-ink-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-2">
          {groups.map(g => {
            const first = g.companyName.charAt(0).toUpperCase();
            const av    = avatarColor(g.companyName);
            const sel   = selectedId === g.employerId;
            const pct   = g.totalAccounts > 0 ? Math.round((g.verifiedCount / g.totalAccounts) * 100) : 0;

            return (
              <tr
                key={g.employerId}
                onClick={() => onSelect(g)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-brand-soft/60" : "hover:bg-canvas/80"}`}
              >
                {/* Employer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]" style={{ background: av }}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-ink truncate leading-none">{g.companyName}</p>
                      <p className="text-[11px] text-ink-3 font-mono mt-0.5 leading-none">{g.companyCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-[600] text-ink-3 tabular-nums">{g.totalAccounts}</span>
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
                {/* Progress bar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-ink-3 tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                </td>
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
