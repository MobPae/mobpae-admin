import type { BankAccount } from "../../types/bankAccount";

interface Props {
  accounts: BankAccount[];
  selectedId: string | null;
  onSelect: (a: BankAccount) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500",    B:"bg-pink-500",    C:"bg-fuchsia-500", D:"bg-brand",
  E:"bg-brand",  F:"bg-brand",  G:"bg-brand",    H:"bg-sky-500",
  I:"bg-cyan-500",    J:"bg-brand",    K:"bg-brand", L:"bg-brand",
  M:"bg-lime-500",    N:"bg-yellow-500",  O:"bg-amber-500",   P:"bg-orange-500",
  Q:"bg-danger-soft0",     R:"bg-rose-600",    S:"bg-pink-600",    T:"bg-fuchsia-600",
  U:"bg-brand",  V:"bg-brand",  W:"bg-brand",  X:"bg-brand",
  Y:"bg-sky-600",     Z:"bg-cyan-600",
};

export default function BankVerificationTable({ accounts, selectedId, onSelect }: Props) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "9%"  }} />
          <col style={{ width: "8%"  }} />
          <col style={{ width: "7%"  }} />
        </colgroup>
        <thead>
          <tr className="border-b border-edge bg-canvas/60">
            {["Employee","Email","Employer","Bank","Account","IFSC","Status",""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-ink-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-2">
          {accounts.map(a => {
            const first = a.employee.name.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-brand";
            const sel   = selectedId === a.id;
            return (
              <tr
                key={a.id}
                onClick={() => onSelect(a)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-brand-soft/60" : "hover:bg-canvas/80"}`}
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-ink truncate leading-none">{a.employee.name}</p>
                      <p className="text-[11px] text-ink-3 font-mono mt-0.5 leading-none">{a.employee.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-ink-3 truncate block">{a.employee.email}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-ink-3 truncate leading-none">{a.employee.employer.companyName}</p>
                  <p className="text-[11px] font-mono text-ink-3 mt-0.5 leading-none">{a.employee.employer.companyCode}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-ink-3 truncate leading-none">{a.bankName ?? "—"}</p>
                  <p className="text-[11px] text-ink-3 mt-0.5 leading-none truncate">{a.accountHolderName}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono text-ink-3">{a.accountNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono text-ink-3">{a.ifscCode}</span>
                </td>
                <td className="px-4 py-3">
                  {a.verified ? (
                    <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] bg-success-bg text-success-dark">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] bg-amber-50 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-brand" : "text-brand group-hover:text-brand"}`}>
                    {a.verified ? "View →" : "Review →"}
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
