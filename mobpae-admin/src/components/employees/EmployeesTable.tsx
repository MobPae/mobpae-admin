import type { Employee } from "../../types/employee";

interface EmployeesTableProps {
  employees: Employee[];
}

export default function EmployeesTable({ employees }: EmployeesTableProps) {
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
                Salary
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>

              <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Added On
              </th>

              <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee, index) => (
              <tr
                key={employee.id}
                className={`
                  border-b
                  border-slate-100
                  hover:bg-blue-50
                  transition-colors
                  ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                `}
              >
                {/* Employee */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-semibold
                      "
                    >
                      {employee.name.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {employee.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {employee.employeeCode}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Employer */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {employee.employer.companyName}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {employee.employer.companyCode}
                      </span>

                      {employee.employer.status === "SUSPENDED" && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Salary */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{Number(employee.salaryInHand).toLocaleString()}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        employee.employmentStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.employmentStatus === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {employee.employer.status === "SUSPENDED" && (
                      <span
                        className="
                          inline-flex
                          w-fit
                          px-2.5
                          py-1
                          rounded-full
                          text-[11px]
                          font-medium
                          bg-red-100
                          text-red-700
                        "
                      >
                        Employer Inactive
                      </span>
                    )}
                  </div>
                </td>

                {/* Created */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {new Date(employee.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <button
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
                      hover:border-blue-200
                      transition-all
                    "
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No Employees Found
            </h3>

            <p className="text-slate-500 mt-2">
              Employees will appear here once onboarded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
