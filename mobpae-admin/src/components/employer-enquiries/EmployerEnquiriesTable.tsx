import type { EmployerEnquiry, EmployerEnquiryStatus } from "../../types/employer-enquiry";

interface Props {
  enquiries: EmployerEnquiry[];
  onView: (enquiry: EmployerEnquiry) => void;
}

const STATUS_STYLES: Record<EmployerEnquiryStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 border border-amber-100",
  CONTACTED: "bg-blue-50 text-blue-700 border border-blue-100",
  APPROVED: "bg-green-50 text-green-700 border border-green-100",
  REJECTED: "bg-red-50 text-red-600 border border-red-100",
};

const STATUS_LABELS: Record<EmployerEnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function EmployerEnquiriesTable({ enquiries, onView }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Company
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Contact
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Est. Employees
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Submitted
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {enquiries.map((enquiry) => (
              <tr
                key={enquiry.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                {/* Company */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {enquiry.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {enquiry.companyName}
                      </p>
                      <p className="text-xs text-slate-500">{enquiry.email}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-800">
                    {enquiry.contactPerson}
                  </p>
                  <p className="text-xs text-slate-500">{enquiry.phone}</p>
                </td>

                {/* Employee Count */}
                <td className="px-5 py-4">
                  {enquiry.employeeCount != null ? (
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {enquiry.employeeCount.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      STATUS_STYLES[enquiry.status]
                    }`}
                  >
                    {STATUS_LABELS[enquiry.status]}
                  </span>
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <span className="text-xs text-slate-500">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onView(enquiry)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2"
                  >
                    Review →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-500">
          {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}
        </p>
      </div>
    </div>
  );
}
