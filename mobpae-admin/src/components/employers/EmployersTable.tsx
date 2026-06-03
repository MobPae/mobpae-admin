interface Employer {
  id: string;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  payrollDate: number;
  payrollCutoffDate: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface EmployersTableProps {
  employers: Employer[];
  onView: (employer: Employer) => void;
}

export default function EmployersTable({
  employers,
  onView,
}: EmployersTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Company
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Company Code
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Contact
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Payroll
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Updated
              </th>

              <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {employers.map((employer, index) => (
              <tr
                key={employer.id}
                className={`
                  border-b
                  border-slate-100
                  hover:bg-slate-50
                  transition-colors
                  ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                `}
              >
                {/* Company */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-8
                        h-8
                        rounded-lg
                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-xs
                        font-semibold
                      "
                    >
                      {employer.companyName.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {employer.companyName}
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {employer.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Company Code */}
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {employer.companyCode}
                  </span>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {employer.contactPerson}
                    </p>

                    <p className="text-xs text-slate-500">Primary Contact</p>
                  </div>
                </td>

                {/* Payroll */}
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                    {employer.payrollDate}th
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      employer.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {employer.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Updated */}
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                    {new Date(
                      employer.updatedAt || employer.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onView(employer)}
                    className="
                      text-blue-600
                      text-sm
                      font-medium
                      hover:text-blue-700
                      transition-colors
                    "
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
