import { Landmark, TrendingUp, Wallet } from "lucide-react";

export default function FinancialOverview() {
  const metrics = [
    {
      title: "Total Disbursed",
      value: "₹4.2L",
      subtitle: "This month",
      icon: Landmark,
      bg: "bg-[#F3F0FF]",
      text: "text-[#5B34FF]",
    },
    {
      title: "Total Repaid",
      value: "₹95K",
      subtitle: "Recovery received",
      icon: TrendingUp,
      bg: "bg-[#F3F0FF]",
      text: "text-[#5B34FF]",
    },
    {
      title: "Outstanding",
      value: "₹1.8L",
      subtitle: "Pending recovery",
      icon: Wallet,
      bg: "bg-orange-100",
      text: "text-orange-700",
    },
  ];

  return (
    <div className="col-span-4 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-base font-semibold text-[#111827]">
          Financial Overview
        </h3>

        <p className="text-xs text-[#6B7280] mt-1">
          Salary advance portfolio summary
        </p>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3 mt-2">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                  flex
                  items-center
                  justify-between
                  p-3
                  rounded-2xl
                  border
                  border-[#E5E7EB]
                  hover:bg-[#F8F9FC]
                  transition-all
                "
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                      w-10
                      h-10
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      ${item.bg}
                    `}
                >
                  <Icon size={18} className={item.text} />
                </div>

                <div>
                  <p className="text-xs text-[#6B7280]">{item.title}</p>

                  <p className="text-sm font-medium text-[#111827] mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-[#111827]">{item.value}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}
