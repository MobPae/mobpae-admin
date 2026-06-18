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
      accentBg: "bg-blue-50",
      accentColor: "text-blue-600",
      countBg: "bg-blue-100",
      countColor: "text-blue-700",
    },
    {
      label: "Disbursals",
      description: "Ready to process",
      icon: ArrowDownCircle,
      count: data.pendingDisbursals,
      to: "/disbursals",
      accentBg: "bg-blue-50",
      accentColor: "text-blue-600",
      countBg: "bg-blue-100",
      countColor: "text-blue-700",
    },
    {
      label: "Active Repayments",
      description: "Scheduled",
      icon: RefreshCcw,
      count: data.activeRepayments,
      to: "/repayments",
      accentBg: "bg-green-50",
      accentColor: "text-green-600",
      countBg: "bg-green-100",
      countColor: "text-green-700",
    },
    {
      label: "Bank Verifications",
      description: "Accounts to verify",
      icon: Landmark,
      count: 0,
      to: "/bank-verification",
      accentBg: "bg-slate-50",
      accentColor: "text-slate-600",
      countBg: "bg-slate-100",
      countColor: "text-slate-600",
    },
    {
      label: "Enquiries",
      description: "Employer leads",
      icon: Building2,
      count: 0,
      to: "/employer-enquiries",
      accentBg: "bg-blue-50",
      accentColor: "text-blue-600",
      countBg: "bg-blue-100",
      countColor: "text-blue-700",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse mb-3" />
              <div className="h-5 w-10 bg-slate-100 rounded animate-pulse mb-1.5" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-slate-900">Action Queue</h2>
        <span className="text-[11px] text-slate-400">Click to navigate</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100">
        {items.map((item) => {
          const Icon = item.icon;
          const hasCount = item.count > 0;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="p-5 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${item.accentBg} group-hover:scale-105 transition-transform`}>
                <Icon size={15} className={item.accentColor} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[22px] font-[750] tracking-tight text-slate-900 leading-none">
                  {item.count}
                </span>
                {hasCount && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.countBg} ${item.countColor}`}>
                    pending
                  </span>
                )}
              </div>
              <div className="text-[12px] font-medium text-slate-700">{item.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
