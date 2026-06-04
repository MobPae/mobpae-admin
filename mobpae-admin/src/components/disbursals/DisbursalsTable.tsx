import type { Disbursal } from "../../types/disbursal";

interface Props {
  disbursals: Disbursal[];
  onView: (disbursal: Disbursal) => void;
}

export default function DisbursalsTable({ disbursals, onView }: Props) {
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
                Disbursed On
              </th>

              <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {disbursals.map((disbursal, index) => (
              <tr
                key={disbursal.id}
                className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {disbursal.salaryRequest.employee.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {disbursal.salaryRequest.employee.employeeCode}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {disbursal.salaryRequest.employee.email}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {disbursal.salaryRequest.employee.employer.companyName}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {disbursal.salaryRequest.employee.employer.companyCode}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          disbursal.salaryRequest.employee.employer.status ===
                          "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {disbursal.salaryRequest.employee.employer.status}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{Number(disbursal.amount).toLocaleString()}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      disbursal.status === "DISBURSED"
                        ? "bg-green-100 text-green-700"
                        : disbursal.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {disbursal.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {disbursal.disbursedAt
                    ? new Date(disbursal.disbursedAt).toLocaleDateString()
                    : "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onView(disbursal)}
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
