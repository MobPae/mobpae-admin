import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  ShieldCheck,
  Landmark,
  ArrowDownCircle,
  RefreshCcw,
  Building2,
} from "lucide-react";
import type { AdminDashboard } from "../../types/dashboard";

interface ActionItem {
  label: string;
  description: string;
  icon: LucideIcon;
  count: number;
  to: string;
  accentBg: string;
  accentColor: string;
  countBg: string;
  countColor: string;
}

interface ActionQueueProps {
  data: AdminDashboard;
  loading?: boolean;
}

export default function ActionQueue({ data, loading = false }: ActionQueueProps) {
  const navigate = useNavigate();

  const items: ActionItem[] = [
    {
      label: "Salary Requests",
      description: "Awaiting review",
      icon: FileText,
      count: data.pendingSalaryRequests,
      to: "/salary-requests",
      accentBg: "bg-amber-50",
      accentColor: "text-amber-600",
      countBg: "bg-amber-100",
      countColor: "text-amber-700",
    },
    {
      label: "KYC Reviews",
      description: "Documents pending",
      icon: ShieldCheck,
      count: data.pendingKycDocuments,
      to: "/kyc",
      accentBg: "bg-[#ECEBFF]",
      accentColor: "text-[#7679FF]",
      countBg: "bg-[#ECEBFF]",
      countColor: "text-[#5659D9]",
    },
    {
      label: "Disbursals",
      description: "Ready to process",
      icon: ArrowDownCircle,
      count: data.pendingDisbursals,
      to: "/disbursals",
      accentBg: "bg-[#ECEBFF]",
      accentColor: "text-[#7679FF]",
      countBg: "bg-[#ECEBFF]",
      countColor: "text-[#5659D9]",
    },
    {
      label: "Active Repayments",
      description: "Scheduled",
      icon: RefreshCcw,
      count: data.activeRepayments,
      to: "/repayments",
      accentBg: "bg-[#ECEBFF]",
      accentColor: "text-[#7679FF]",
      countBg: "bg-[#ECEBFF]",
      countColor: "text-[#5659D9]",
    },
    {
      label: "Bank Verifications",
      description: "Accounts to verify",
      icon: Landmark,
      count: 0,
      to: "/bank-verification",
      accentBg: "bg-[#F7F7FB]",
      accentColor: "text-[#62657A]",
      countBg: "bg-[#F0F0F8]",
      countColor: "text-[#62657A]",
    },
    {
      label: "Enquiries",
      description: "Employer leads",
      icon: Building2,
      count: 0,
      to: "/employer-enquiries",
      accentBg: "bg-[#ECEBFF]",
      accentColor: "text-[#7679FF]",
      countBg: "bg-[#ECEBFF]",
      countColor: "text-[#5659D9]",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white border border-[#E4E4EF] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E4EF]">
          <div className="h-4 w-28 bg-[#F0F0F8] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-[#E4E4EF]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5">
              <div className="w-8 h-8 rounded-xl bg-[#F0F0F8] animate-pulse mb-3" />
              <div className="h-5 w-10 bg-[#F0F0F8] rounded animate-pulse mb-1.5" />
              <div className="h-3 w-24 bg-[#F0F0F8] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E4EF] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E4E4EF] flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[#191A2E]">Action Queue</h2>
        <span className="text-[11px] text-[#62657A]">Click to navigate</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-[#E4E4EF]">
        {items.map((item) => {
          const Icon = item.icon;
          const hasCount = item.count > 0;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="p-5 text-left hover:bg-[#F7F7FB] transition-colors group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${item.accentBg} group-hover:scale-105 transition-transform`}>
                <Icon size={15} className={item.accentColor} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[22px] font-[750] tracking-tight text-[#191A2E] leading-none">
                  {item.count}
                </span>
                {hasCount && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${item.countBg} ${item.countColor}`}>
                    pending
                  </span>
                )}
              </div>
              <div className="text-[12px] font-medium text-[#62657A]">{item.label}</div>
              <div className="text-[11px] text-[#62657A] mt-0.5">{item.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
