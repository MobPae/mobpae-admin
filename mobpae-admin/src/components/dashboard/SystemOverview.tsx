import { Building2, Users, Wallet, Landmark, TrendingUp } from "lucide-react";

export default function SystemOverview() {
  const metrics = [
    {
      label: "Employers",
      value: "12",
      icon: Building2,
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    {
      label: "Employees",
      value: "1,248",
      icon: Users,
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    {
      label: "Requests",
      value: "38",
      icon: Wallet,
      className: "bg-orange-100 text-orange-700 border border-orange-200",
    },
    {
      label: "Disbursed",
      value: "₹4.2L",
      icon: Landmark,
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    {
      label: "Repaid",
      value: "₹95K",
      icon: TrendingUp,
      className: "bg-green-100 text-green-700 border border-green-200",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                  ${metric.className}
                `}
            >
              <Icon size={12} />

              <span className="uppercase text-[10px] text-xs tracking-wide">
                {metric.label}
              </span>

              <span className="font-semibold text-[11px]">{metric.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
