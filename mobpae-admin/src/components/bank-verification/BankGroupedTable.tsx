import type { BankEmployerGroup } from "../../types/bankAccount";

interface Props {
  groups: BankEmployerGroup[];
  selectedId: string | null;
  onSelect: (g: BankEmployerGroup) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500", B:"bg-pink-500", C:"bg-fuchsia-500", D:"bg-[#315eff]",
  E:"bg-indigo-500", F:"bg-violet-500", G:"bg-purple-500", H:"bg-sky-500",
  I:"bg-cyan-500", J:"bg-[#315eff]", K:"bg-[#315eff]", L:"bg-[#315eff]",
  M:"bg-lime-500", N:"bg-yellow-500", O:"bg-amber-500", P:"bg-orange-500",
  Q:"bg-red-500", R:"bg-rose-600", S:"bg-pink-600", T:"bg-fuchsia-600",
  U:"bg-[#315eff]", V:"bg-indigo-600", W:"bg-violet-600", X:"bg-[#315eff]",
  Y:"bg-sky-600", Z:"bg-cyan-600",
};

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
          <tr className="border-b border-[#E5E7EB] bg-[#F8F9FC]/60">
            {["Employer", "Total", "Pending", "Verified", "Status breakdown", ""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-[#6B7280]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F4F6]">
          {groups.map(g => {
            const first = g.companyName.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-[#315eff]";
            const sel   = selectedId === g.employerId;
            const pct   = g.totalAccounts > 0 ? Math.round((g.verifiedCount / g.totalAccounts) * 100) : 0;

            return (
              <tr
                key={g.employerId}
                onClick={() => onSelect(g)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-[#EEF2FF]/60" : "hover:bg-[#F8F9FC]/80"}`}
              >
                {/* Employer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-[#111827] truncate leading-none">{g.companyName}</p>
                      <p className="text-[11px] text-[#6B7280] font-mono mt-0.5 leading-none">{g.companyCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-[600] text-[#6B7280] tabular-nums">{g.totalAccounts}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.pendingCount > 0 ? "text-amber-600" : "text-[#6B7280]"}`}>
                    {g.pendingCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.verifiedCount > 0 ? "text-[#315eff]" : "text-[#6B7280]"}`}>
                    {g.verifiedCount}
                  </span>
                </td>
                {/* Progress bar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#315eff] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7280] tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-[#315eff]" : "text-[#6B7280] group-hover:text-[#315eff]"}`}>
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
