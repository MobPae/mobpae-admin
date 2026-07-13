import { Clock3, CheckCircle2, XCircle, Wallet } from "lucide-react";

interface Props {
  disbursals: any[];
}

export default function DisbursalStats({ disbursals }: Props) {
  const pending = disbursals.filter((d) => d.status === "PENDING").length;

  const disbursed = disbursals.filter((d) => d.status === "SUCCESS").length;

  const failed = disbursals.filter((d) => d.status === "FAILED").length;

  const stats = [
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-warning",
    },
    {
      title: "Disbursed",
      value: disbursed,
      icon: CheckCircle2,
      bg: "bg-brand-soft",
      color: "text-brand",
    },
    {
      title: "Failed",
      value: failed,
      icon: XCircle,
      bg: "bg-danger-soft",
      color: "text-danger",
    },
    {
      title: "Total",
      value: disbursals.length,
      icon: Wallet,
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
