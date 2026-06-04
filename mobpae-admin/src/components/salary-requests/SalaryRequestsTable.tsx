import type { SalaryRequest } from "../../types/salary-request";

interface SalaryRequestsTableProps {
  requests: SalaryRequest[];
  onView: (request: SalaryRequest) => void;
}

export default function SalaryRequestsTable({
  requests,
  onView,
}: SalaryRequestsTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/80">
              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employee
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employer
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Amount
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Requested On
              </th>

              <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request, index) => (
              <tr
                key={request.id}
                className={`
                  border-b
                  border-slate-100
                  hover:bg-blue-50
                  transition-colors
                  ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                `}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {request.employee.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {request.employee.employeeCode}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {request.employee.email}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {request.employee.employer.companyName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {request.employee.employer.companyCode}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{Number(request.amount).toLocaleString()}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      request.status === "APPROVED" ||
                      request.status === "REPAID"
                        ? "bg-green-100 text-green-700"
                        : request.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : request.status === "DISBURSED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onView(request)}
                    className="
                      px-3
                      py-1.5
                      rounded-xl
                      border
                      border-slate-200
                      text-xs
                      font-medium
                      text-blue-600
                      hover:bg-blue-50
                    "
                  >
                    View
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
