import { ShieldCheck, Landmark, Wallet } from "lucide-react";

export default function PendingActionsTable() {
  const actions = [
    {
      employee: {
        name: "Amit Kumar",
        code: "EMP001",
        email: "amit@xyz.com",
      },
      type: "KYC Verification",
      description: "Employee onboarding review",
      priority: "HIGH",
      time: "10 mins ago",
      icon: ShieldCheck,
      statusColor: "bg-red-100 text-red-700 border-red-200",
    },
    {
      employee: {
        name: "Rahul Sharma",
        code: "EMP002",
        email: "rahul@xyz.com",
      },
      type: "Bank Verification",
      description: "Verify account details",
      priority: "MEDIUM",
      time: "25 mins ago",
      icon: Landmark,
      statusColor: "bg-orange-100 text-orange-700 border-orange-200",
    },
    {
      employee: {
        name: "Priya Patel",
        code: "EMP003",
        email: "priya@xyz.com",
      },
      type: "Salary Request",
      description: "Advance salary review",
      priority: "HIGH",
      time: "40 mins ago",
      icon: Wallet,
      statusColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Pending Actions
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Items requiring immediate attention
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
          7 Urgent
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Employee
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Action Type
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Priority
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Time
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {actions.slice(0, 3).map((item, index) => {
              const Icon = item.icon;

              return (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.employee.name}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {item.employee.code}
                        </span>

                        <span className="w-1 h-1 rounded-full bg-slate-300" />

                        <span className="text-xs text-slate-500">
                          {item.employee.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon size={16} className="text-slate-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.type}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span
                      className={`
                          px-2.5 py-1
                          rounded-full
                          text-[11px]
                          font-medium
                          border
                          ${item.statusColor}
                        `}
                    >
                      {item.priority}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{item.time}</span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      className="
                          px-4
                          py-2
                          rounded-xl
                          bg-slate-900
                          text-white
                          text-xs
                          font-medium
                          hover:bg-slate-800
                          transition-all
                        "
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
