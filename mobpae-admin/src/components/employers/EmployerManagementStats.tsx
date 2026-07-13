import { Clock3, CheckCircle2, XCircle, Building2 } from "lucide-react";

const stats = [
  {
    title: "Pending",
    value: 12,
    icon: Clock3,
    color: "text-warning",
    bg: "bg-amber-50",
  },
  {
    title: "Approved",
    value: 8,
    icon: CheckCircle2,
    color: "text-brand",
    bg: "bg-brand-soft",
  },
  {
    title: "Rejected",
    value: 2,
    icon: XCircle,
    color: "text-danger",
    bg: "bg-danger-soft",
  },
  {
    title: "Total",
    value: 22,
    icon: Building2,
    color: "text-brand",
    bg: "bg-brand-soft",
  },
];

export default function EmployerStats() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border border-edge rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-3 text-sm">{stat.title}</p>

                <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}
              >
                <Icon size={22} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
