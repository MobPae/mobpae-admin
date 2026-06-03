import { Clock3, CheckCircle2, XCircle, Building2 } from "lucide-react";

const stats = [
  {
    title: "Total Enquiries",
    value: 22,
    icon: Building2,
    bg: "bg-blue-600",
  },
  {
    title: "New Requests",
    value: 12,
    icon: Clock3,
    bg: "bg-amber-500",
  },
  {
    title: "Approved",
    value: 8,
    icon: CheckCircle2,
    bg: "bg-green-600",
  },
  {
    title: "Rejected",
    value: 2,
    icon: XCircle,
    bg: "bg-red-600",
  },
];

export default function EmployerStats() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className={`
              ${stat.bg}
              rounded-2xl
              px-5
              py-4
              text-white
              min-h-[92px]
              flex
              items-center
              justify-between
            `}
          >
            <div>
              <p className="text-xs font-medium text-white/80">{stat.title}</p>

              <h2 className="text-2xl font-semibold mt-1">{stat.value}</h2>
            </div>

            <div className="opacity-80">
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
