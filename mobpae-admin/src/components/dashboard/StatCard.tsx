import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconBg,
  iconColor,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] animate-pulse" />
        </div>
        <div className="h-7 w-20 bg-[#F3F4F6] rounded-lg animate-pulse mb-2" />
        <div className="h-3.5 w-28 bg-[#F3F4F6] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className="text-[26px] font-[750] tracking-tight text-[#111827] leading-none">
        {value}
      </div>
      <div className="text-[13px] text-[#6B7280] mt-1.5">{label}</div>
      {sublabel && (
        <div className="text-[11px] text-[#6B7280] mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}
