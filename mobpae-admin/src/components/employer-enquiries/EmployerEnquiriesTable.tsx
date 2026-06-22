import type { EmployerEnquiry, EmployerEnquiryStatus } from "../../types/employer-enquiry";

interface Props {
  enquiries: EmployerEnquiry[];
  selectedId: string | null;
  onSelect: (enquiry: EmployerEnquiry) => void;
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

const STATUS_CONFIG: Record<EmployerEnquiryStatus, { label: string; dot: string; text: string; bg: string }> = {
  NEW:       { label: "New", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  CONTACTED: { label: "Contacted", dot: "bg-[#378ADD]", text: "text-[#185FA5]", bg: "bg-[#E7F1FC]" },
  APPROVED:  { label: "Onboarded", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  ONBOARDED: { label: "Onboarded", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REJECTED:  { label: "Rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const TH = "px-4 py-2.5 text-left text-[11px] font-[600] uppercase tracking-[0.08em] text-[#62657A] whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function EmployerEnquiriesTable({ enquiries, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E4EF] overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E4E4EF] bg-[#F7F7FB]">
            <th className={TH}>Company</th>
            <th className={TH}>Email</th>
            <th className={TH}>Contact</th>
            <th className={TH}>Phone</th>
            <th className={TH}>Employees</th>
            <th className={TH}>Status</th>
            <th className={TH}>Received</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enq) => {
            const isSelected = selectedId === enq.id;
            const s = STATUS_CONFIG[enq.status] ?? { label: enq.status, dot: "bg-[#B7B9C7]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" };
            return (
              <tr
                key={enq.id}
                onClick={() => onSelect(enq)}
                className={`border-b border-[#F0F0F8] last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-[#ECEBFF]/60" : "hover:bg-[#F7F7FB]/70"
                }`}
              >
                {/* Company */}
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${avatarBg(enq.companyName)} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}>
                      {enq.companyName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[12px] font-[500] text-[#191A2E] truncate leading-none">{enq.companyName}</p>
                  </div>
                </td>

                {/* Email */}
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A] truncate">{enq.email}</p>
                </td>

                {/* Contact person */}
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#191A2E] truncate">{enq.contactPerson}</p>
                </td>

                {/* Phone */}
                <td className={TD}>
                  <p className="text-[12px] text-[#62657A] font-mono">{enq.phone}</p>
                </td>

                {/* Employees */}
                <td className={TD}>
                  {enq.employeeCount != null
                    ? <p className="text-[12px] font-[500] text-[#191A2E]">{enq.employeeCount.toLocaleString("en-IN")}</p>
                    : <p className="text-[12px] text-[#62657A]">—</p>
                  }
                </td>

                {/* Status */}
                <td className={TD}>
                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${s.bg} ${s.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${s.dot}`} />
                    {s.label}
                  </span>
                </td>

                {/* Received */}
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-[#62657A]">{timeAgo(enq.createdAt)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-[#E4E4EF] bg-[#F7F7FB]/50">
        <p className="text-[11px] text-[#62657A]">{enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}</p>
      </div>
    </div>
  );
}
