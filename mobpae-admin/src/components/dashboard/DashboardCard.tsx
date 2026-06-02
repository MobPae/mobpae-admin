import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="text-4xl font-extrabold mt-2 text-slate-800">
            {value}
          </h2>

          {trend && <p className="text-sm text-green-600 mt-2">{trend}</p>}
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
