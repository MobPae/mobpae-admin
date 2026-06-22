import type {
  Employer,
  EmployerStatus,
  EmployerRiskStatus,
} from "../../types/employer";

interface Props {
  employers: Employer[];
  selectedId: string | null;
  onSelect: (employer: Employer) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A: "bg-rose-500",
  B: "bg-pink-500",
  C: "bg-fuchsia-500",
  D: "bg-[#ECEBFF]0",
  E: "bg-[#ECEBFF]0",
  F: "bg-[#ECEBFF]0",
  G: "bg-[#ECEBFF]0",
  H: "bg-sky-500",
  I: "bg-cyan-500",
  J: "bg-[#7679FF]",
  K: "bg-[#7679FF]",
  L: "bg-[#ECEBFF]0",
  M: "bg-lime-600",
  N: "bg-yellow-600",
  O: "bg-amber-500",
  P: "bg-orange-500",
  Q: "bg-red-500",
  R: "bg-rose-600",
  S: "bg-pink-600",
  T: "bg-fuchsia-600",
  U: "bg-[#7679FF]",
  V: "bg-[#7679FF]",
  W: "bg-[#7679FF]",
  X: "bg-[#7679FF]",
  Y: "bg-sky-600",
  Z: "bg-cyan-600",
};
const avatarBg = (n: string) =>
  AVATAR_COLORS[n.charAt(0).toUpperCase()] ?? "bg-[#7679FF]";

const STATUS_CONFIG: Record<
  EmployerStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  ACTIVE:   { label: "Active", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  PENDING:  { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  APPROVED: { label: "Approved", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REJECTED: { label: "Rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  INACTIVE:  { label: "Inactive",  dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]"  },
  SUSPENDED: { label: "Suspended", dot: "bg-[#D45F18]",  text: "text-[#9A4910]", bg: "bg-[#FEF1E7]"  },
};

const RISK_CONFIG: Record<
  EmployerRiskStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  GOOD:    { label: "Good",    dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  WARNING: { label: "Warning", dot: "bg-[#D45F18]",  text: "text-[#9A4910]", bg: "bg-[#FEF1E7]"  },
  BLOCKED: { label: "Blocked", dot: "bg-red-400",    text: "text-red-600",   bg: "bg-red-50"     },
};

const TH =
  "px-4 py-2.5 text-left text-[11px] font-[600] uppercase tracking-[0.08em] text-[#62657A] whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function EmployersTable({
  employers,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E4EF] overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]">
            <th className={TH}>Company</th>
            <th className={TH}>Email</th>
            <th className={TH}>Contact</th>
            <th className={TH}>Phone</th>
            <th className={TH}>Payroll</th>
            <th className={TH}>Status</th>
            <th className={TH}>Risk</th>
            <th className={TH}></th>
          </tr>
        </thead>
        <tbody>
          {employers.map((emp) => {
            const isSelected = selectedId === emp.id;
            const s = STATUS_CONFIG[emp.status];
            const r = RISK_CONFIG[emp.riskStatus];
            return (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`border-b border-[#F0F0F8] last:border-0 cursor-pointer transition-colors group ${
                  isSelected ? "bg-[#ECEBFF]/60" : "hover:bg-[#F7F7FB]/70"
                }`}
              >
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg ${avatarBg(
                        emp.companyName
                      )} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}
                    >
                      {emp.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-[#191A2E] leading-none truncate">
                        {emp.companyName}
                      </p>
                      <span className="font-mono text-[11px] text-[#62657A]">
                        {emp.companyCode}
                      </span>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A] truncate">
                    {emp.email}
                  </p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#191A2E] truncate">
                    {emp.contactPerson}
                  </p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A] font-mono">
                    {emp.phone}
                  </p>
                </td>
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#191A2E]">
                    {emp.payrollDate}th
                  </p>
                  <p className="text-[11px] text-[#62657A] mt-0.5">
                    cutoff {emp.payrollCutoffDate}th
                  </p>
                </td>
                <td className={TD}>
                  <span
                    className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${s.bg} ${s.text}`}
                  >
                    <span
                      className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${s.dot}`}
                    />
                    {s.label}
                  </span>
                </td>
                <td className={TD}>
                  <span
                    className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${r.bg} ${r.text}`}
                  >
                    <span
                      className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${r.dot}`}
                    />
                    {r.label}
                  </span>
                </td>
                <td className={TD}>
                  <span
                    className={`text-[11px] font-[500] transition-colors ${
                      isSelected ? "text-[#7679FF]" : "text-[#7679FF]"
                    }`}
                  >
                    {isSelected ? "Close" : "Manage →"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-[#E4E4EF] bg-[#F7F7FB]/50">
        <p className="text-[11px] text-[#62657A]">
          {employers.length} {employers.length === 1 ? "employer" : "employers"}
        </p>
      </div>
    </div>
  );
}
