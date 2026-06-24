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
      statusColor: "bg-red-50 text-red-600 border-red-100",
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
      statusColor: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
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
      statusColor: "bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]",
    },
  ];

  return (
    <div className="col-span-8 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            Pending Actions
          </h3>

          <p className="text-xs text-[#6B7280] mt-1">
            Items requiring immediate attention
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
          7 Urgent
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left">
              <th className="px-6 py-3 text-xs font-medium text-[#6B7280] uppercase">
                Employee
              </th>

              <th className="px-6 py-3 text-xs font-medium text-[#6B7280] uppercase">
                Action Type
              </th>

              <th className="px-6 py-3 text-xs font-medium text-[#6B7280] uppercase">
                Priority
              </th>

              <th className="px-6 py-3 text-xs font-medium text-[#6B7280] uppercase">
                Time
              </th>

              <th className="px-6 py-3 text-xs font-medium text-[#6B7280] uppercase">
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
                  className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8F9FC]"
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {item.employee.name}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#6B7280]">
                          {item.employee.code}
                        </span>

                        <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />

                        <span className="text-xs text-[#6B7280]">
                          {item.employee.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                        <Icon size={16} className="text-[#6B7280]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {item.type}
                        </p>

                        <p className="text-xs text-[#6B7280]">
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
                    <span className="text-sm text-[#6B7280]">{item.time}</span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      className="
                          px-4
                          py-2
                          rounded-xl
                          bg-[#111827]
                          text-white
                          text-xs
                          font-medium
                          hover:bg-[#2A2C45]
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
