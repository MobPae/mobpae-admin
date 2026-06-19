import type { BankEmployerGroup } from "../../types/bankAccount";

interface Props {
  groups: BankEmployerGroup[];
  selectedId: string | null;
  onSelect: (g: BankEmployerGroup) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500", B:"bg-pink-500", C:"bg-fuchsia-500", D:"bg-blue-500",
  E:"bg-indigo-500", F:"bg-violet-500", G:"bg-purple-500", H:"bg-sky-500",
  I:"bg-cyan-500", J:"bg-teal-500", K:"bg-emerald-500", L:"bg-green-500",
  M:"bg-lime-500", N:"bg-yellow-500", O:"bg-amber-500", P:"bg-orange-500",
  Q:"bg-red-500", R:"bg-rose-600", S:"bg-pink-600", T:"bg-fuchsia-600",
  U:"bg-blue-600", V:"bg-indigo-600", W:"bg-violet-600", X:"bg-blue-600",
  Y:"bg-sky-600", Z:"bg-cyan-600",
};

export default function BankGroupedTable({ groups, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
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
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {["Employer", "Total", "Pending", "Verified", "Status breakdown", ""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {groups.map(g => {
            const first = g.companyName.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-slate-500";
            const sel   = selectedId === g.employerId;
            const pct   = g.totalAccounts > 0 ? Math.round((g.verifiedCount / g.totalAccounts) * 100) : 0;

            return (
              <tr
                key={g.employerId}
                onClick={() => onSelect(g)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-[#ecfdf5]/60" : "hover:bg-slate-50/80"}`}
              >
                {/* Employer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-slate-900 truncate leading-none">{g.companyName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">{g.companyCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-[600] text-slate-700 tabular-nums">{g.totalAccounts}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.pendingCount > 0 ? "text-amber-600" : "text-slate-400"}`}>
                    {g.pendingCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-[600] tabular-nums ${g.verifiedCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {g.verifiedCount}
                  </span>
                </td>
                {/* Progress bar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-[#059669]" : "text-slate-400 group-hover:text-[#059669]"}`}>
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
