import type { EmployerEnquiry, EmployerEnquiryStatus } from "../../types/employer-enquiry";

interface Props {
  enquiries: EmployerEnquiry[];
  selectedId: string | null;
  onSelect: (enquiry: EmployerEnquiry) => void;
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

const STATUS_CONFIG: Record<EmployerEnquiryStatus, { label: string; dot: string; text: string; bg: string }> = {
  NEW:        { label:"New",       dot:"bg-amber-400",   text:"text-amber-700",   bg:"bg-amber-50"   },
  CONTACTED:  { label:"Contacted", dot:"bg-blue-400",    text:"text-blue-700",    bg:"bg-blue-50"    },
  APPROVED:   { label:"Onboarded", dot:"bg-emerald-400", text:"text-emerald-700", bg:"bg-emerald-50" },
  ONBOARDED:  { label:"Onboarded", dot:"bg-emerald-400", text:"text-emerald-700", bg:"bg-emerald-50" },
  REJECTED:   { label:"Rejected",  dot:"bg-red-400",     text:"text-red-600",     bg:"bg-red-50"     },
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

const TH = "px-4 py-2.5 text-left text-[10px] font-[600] uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap";
const TD = "px-4 py-3.5 align-middle";

export default function EmployerEnquiriesTable({ enquiries, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
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
          <tr className="border-b border-slate-100 bg-slate-50">
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
            const s = STATUS_CONFIG[enq.status] ?? { label: enq.status, dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-100" };
            return (
              <tr
                key={enq.id}
                onClick={() => onSelect(enq)}
                className={`border-b border-slate-50 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Company */}
                <td className={TD}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${avatarBg(enq.companyName)} text-white flex items-center justify-center text-[11px] font-[700] flex-shrink-0`}>
                      {enq.companyName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[12px] font-[500] text-slate-900 truncate leading-none">{enq.companyName}</p>
                  </div>
                </td>

                {/* Email */}
                <td className={TD}>
                  <p className="text-[12px] text-slate-600 truncate">{enq.email}</p>
                </td>

                {/* Contact person */}
                <td className={TD}>
                  <p className="text-[12px] font-[500] text-slate-800 truncate">{enq.contactPerson}</p>
                </td>

                {/* Phone */}
                <td className={TD}>
                  <p className="text-[12px] text-slate-600 font-mono">{enq.phone}</p>
                </td>

                {/* Employees */}
                <td className={TD}>
                  {enq.employeeCount != null
                    ? <p className="text-[12px] font-[500] text-slate-800">{enq.employeeCount.toLocaleString("en-IN")}</p>
                    : <p className="text-[12px] text-slate-300">—</p>
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
                  <p className="text-[12px] font-[500] text-slate-600">{timeAgo(enq.createdAt)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400">{enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}</p>
      </div>
    </div>
  );
}
