import { ShieldCheck, Landmark, Wallet, CheckCircle2 } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      employee: {
        name: "Amit Kumar",
        code: "EMP001",
      },
      activity: "KYC Verified",
      description: "Identity verification completed",
      time: "5 mins ago",
      icon: ShieldCheck,
      color: "bg-[#EEF2FF] text-[#2048EE]",
    },
    {
      employee: {
        name: "Rahul Sharma",
        code: "EMP002",
      },
      activity: "Bank Approved",
      description: "HDFC Bank account verified",
      time: "12 mins ago",
      icon: Landmark,
      color: "bg-[#EEF2FF] text-[#2048EE]",
    },
    {
      employee: {
        name: "Priya Patel",
        code: "EMP003",
      },
      activity: "Salary Request Approved",
      description: "₹15,000 request approved",
      time: "20 mins ago",
      icon: Wallet,
      color: "bg-[#EEF2FF] text-[#2048EE]",
    },
    {
      employee: {
        name: "Vikram Singh",
        code: "EMP004",
      },
      activity: "Repayment Completed",
      description: "Advance salary repaid",
      time: "1 hour ago",
      icon: CheckCircle2,
      color: "bg-[#EEF2FF] text-[#2048EE]",
    },
  ];

  return (
    <div className="col-span-6 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            Recent Activity
          </h3>

          <p className="text-xs text-[#6B7280] mt-1">
            Latest platform activities
          </p>
        </div>

        <button className="text-xs font-medium text-[#315eff] hover:text-[#2048EE]">
          View All
        </button>
      </div>

      {/* Activity Feed */}
      <div className="divide-y divide-[#E5E7EB]">
        {activities.slice(0, 3).map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FC] transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#6B7280]">
                  {item.employee.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#111827]">
                      {item.employee.name}
                    </p>

                    <span className="text-[11px] text-[#6B7280]">
                      {item.employee.code}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7280] mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Activity */}
              <div className="flex items-center gap-3">
                <div
                  className={`
                      flex items-center gap-1
                      px-2.5 py-1
                      rounded-full
                      text-[11px]
                      font-medium
                      ${item.color}
                    `}
                >
                  <Icon size={12} />
                  {item.activity}
                </div>

                <span className="text-xs text-[#6B7280] whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
