import type { KycDocument } from "../../types/kyc";

interface Props {
  documents: KycDocument[];
  selectedId: string | null;
  onSelect: (d: KycDocument) => void;
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

const STATUS_CONFIG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:  { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  VERIFIED: { label: "Verified", dot: "bg-[#22C55E]", text: "text-success-dark", bg: "bg-success-bg" },
  REJECTED: { label: "Rejected", dot: "bg-red-400", text: "text-danger", bg: "bg-danger-soft" },
};

const DOC_LABEL: Record<string, string> = {
  AADHAR:      "Aadhaar",
  PAN:         "PAN Card",
  SALARY_SLIP: "Salary Slip",
  OTHER:       "Other",
};

export default function KycTable({ documents, selectedId, onSelect }: Props) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "19%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "9%"  }} />
        </colgroup>
        <thead>
          <tr className="border-b border-edge bg-canvas/60">
            {["Employee","Email","Employer","Doc type","Status","Submitted on",""].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-[500] uppercase tracking-[0.06em] text-ink-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-2">
          {documents.map(doc => {
            const first = doc.employee.name.charAt(0).toUpperCase();
            const av    = AVATAR_COLORS[first] ?? "bg-brand";
            const sc    = STATUS_CONFIG[doc.status];
            const sel   = selectedId === doc.id;
            return (
              <tr
                key={doc.id}
                onClick={() => onSelect(doc)}
                className={`cursor-pointer transition-colors group ${sel ? "bg-brand-soft/60" : "hover:bg-canvas/80"}`}
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
                      {first}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[500] text-ink truncate leading-none">{doc.employee.name}</p>
                      <p className="text-[11px] text-ink-3 font-mono mt-0.5 leading-none">{doc.employee.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-ink-3 truncate block">{doc.employee.email}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] font-[500] text-ink-3 truncate leading-none">{doc.employee.employer.companyName}</p>
                  <p className="text-[11px] font-mono text-ink-3 mt-0.5 leading-none">{doc.employee.employer.companyCode}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-[500] text-ink-3">{DOC_LABEL[doc.documentType] ?? doc.documentType}</span>
                </td>
                <td className="px-4 py-3">
                  {sc && (
                    <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11px] font-[500] ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-ink-3">
                    {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-[500] transition-colors ${sel ? "text-brand" : "text-brand group-hover:text-brand"}`}>
                    Review →
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
