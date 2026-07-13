import { Landmark, TrendingUp, Wallet } from "lucide-react";

export default function FinancialOverview() {
  const metrics = [
    {
      title: "Total Disbursed",
      value: "₹4.2L",
      subtitle: "This month",
      icon: Landmark,
      bg: "bg-brand-soft",
      text: "text-[#2048EE]",
    },
    {
      title: "Total Repaid",
      value: "₹95K",
      subtitle: "Recovery received",
      icon: TrendingUp,
      bg: "bg-brand-soft",
      text: "text-[#2048EE]",
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
    <div className="col-span-4 bg-white border border-edge rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-edge">
        <h3 className="text-base font-semibold text-ink">
          Financial Overview
        </h3>

        <p className="text-xs text-ink-3 mt-1">
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
                  border-edge
                  hover:bg-canvas
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
                  <p className="text-xs text-ink-3">{item.title}</p>

                  <p className="text-sm font-medium text-ink mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-ink">{item.value}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}
