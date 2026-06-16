import { Clock3, CheckCircle2, XCircle, Wallet } from "lucide-react";

interface SalaryRequestStatsProps {
  requests: any[];
}

export default function SalaryRequestStats({
  requests,
}: SalaryRequestStatsProps) {
  const pending = requests.filter((r) => r.status === "SUBMITTED").length;

  const approved = requests.filter((r) => r.status === "EMPLOYER_APPROVED" || r.status === "READY_FOR_DISBURSAL").length;

  const rejected = requests.filter((r) => r.status === "EMPLOYER_REJECTED").length;

  const stats = [
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      bg: "bg-red-50",
      color: "text-red-600",
    },
    {
      title: "Total",
      value: requests.length,
      icon: Wallet,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border border-slate-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{stat.title}</p>

                <h3 className="text-xl font-semibold text-slate-900 mt-1">
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
