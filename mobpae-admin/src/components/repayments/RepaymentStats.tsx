import { Clock3, CheckCircle2, AlertTriangle, Receipt } from "lucide-react";

interface Props {
  repayments: any[];
}

export default function RepaymentStats({ repayments }: Props) {
  const pending = repayments.filter((r) => r.status === "SCHEDULED").length;

  const paid = repayments.filter((r) => r.status === "PAID").length;

  const overdue = repayments.filter((r) => r.status === "OVERDUE").length;

  const stats = [
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-warning",
    },
    {
      title: "Paid",
      value: paid,
      icon: CheckCircle2,
      bg: "bg-brand-soft",
      color: "text-brand",
    },
    {
      title: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      bg: "bg-danger-soft",
      color: "text-danger",
    },
    {
      title: "Total",
      value: repayments.length,
      icon: Receipt,
      bg: "bg-brand-soft",
      color: "text-brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border border-edge rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-3">{stat.title}</p>

                <h3 className="text-xl font-semibold text-ink mt-1">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}
              >
                <Icon size={18} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
