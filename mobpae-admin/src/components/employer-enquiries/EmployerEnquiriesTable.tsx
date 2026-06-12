import type { EmployerEnquiry, EmployerEnquiryStatus } from "../../types/employer-enquiry";

interface Props {
  enquiries: EmployerEnquiry[];
  selectedId: string | null;
  onSelect: (enquiry: EmployerEnquiry) => void;
}

const STATUS_BADGE: Record<EmployerEnquiryStatus, string> = {
  NEW: "bg-amber-50 text-amber-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<EmployerEnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function EmployerEnquiriesTable({ enquiries, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[20px_1fr_140px_80px_90px_72px_80px] gap-0 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
        {["", "Company", "Contact", "Employees", "Status", "Submitted", ""].map((h, i) => (
          <span key={i} className="text-[10px] font-[500] uppercase tracking-[0.05em] text-slate-400">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {enquiries.map((enquiry) => {
          const isSelected = selectedId === enquiry.id;
          return (
            <div
              key={enquiry.id}
              className={`grid grid-cols-[20px_1fr_140px_80px_90px_72px_80px] gap-0 px-4 py-3 border-b border-slate-50 last:border-0 items-center transition-colors cursor-pointer ${
                isSelected ? "bg-slate-50" : "hover:bg-slate-50/40"
              }`}
              onClick={() => onSelect(enquiry)}
            >
              {/* Selection dot */}
              <div className={`w-[5px] h-[5px] rounded-full transition-colors ${
                isSelected ? "bg-blue-500" : "bg-transparent"
              }`} />

              {/* Company */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[11px] font-[600] flex-shrink-0">
                  {enquiry.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-[500] text-slate-800 leading-none truncate">
                    {enquiry.companyName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate">
                    {enquiry.email}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="min-w-0">
                <p className="text-[12px] font-[500] text-slate-700 leading-none truncate">
                  {enquiry.contactPerson}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  {enquiry.phone}
                </p>
              </div>

              {/* Employee count */}
              <div>
                {enquiry.employeeCount != null ? (
                  <span className="text-[12px] text-slate-700">
                    {enquiry.employeeCount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-300">—</span>
                )}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[enquiry.status]}`}>
                  {STATUS_LABEL[enquiry.status]}
                </span>
              </div>

              {/* Date */}
              <span className="text-[11px] text-slate-400">
                {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>

              {/* Action */}
              <div className="text-right">
                <span className="text-[11px] font-[500] text-slate-400 group-hover:text-slate-600">
                  {isSelected ? "Close" : "Review →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[10px] text-slate-400">
          {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}
        </p>
      </div>
    </div>
  );
}
