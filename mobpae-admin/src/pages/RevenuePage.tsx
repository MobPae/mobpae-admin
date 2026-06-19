import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, CreditCard, TrendingUp } from "lucide-react";
import { getRevenueSummary } from "../services/dashboardService";

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return fmt.format(Number.isFinite(n as number) ? (n as number) : 0);
};

function RevenueCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-6 py-5 flex flex-col gap-3 ${
        highlight
          ? "bg-[#059669] border border-[#047857]"
          : "bg-white border border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[12px] font-[500] ${highlight ? "text-white/60" : "text-slate-500"}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-[28px] font-[700] tracking-[-0.02em] leading-none ${highlight ? "text-white" : "text-slate-900"}`}>
          {value}
        </p>
        {sub && <p className={`text-[11px] mt-1.5 ${highlight ? "text-white/40" : "text-slate-400"}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const { data: revenue, isLoading, error } = useQuery({
    queryKey: ["revenue-summary"],
    queryFn: getRevenueSummary,
  });

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Revenue</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Platform revenue from memberships and interest</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white border border-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <p className="text-[13px] font-[500] text-red-700">Failed to load revenue data</p>
          <p className="text-[12px] text-red-500 mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      )}

      {revenue && (
        <>
          {/* Revenue cards — GET /membership/revenue-summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RevenueCard
              label="Total Revenue"
              value={formatCurrency(revenue.totalRevenue)}
              icon={<TrendingUp size={16} />}
              iconBg="bg-white/15"
              iconColor="text-white/80"
              sub="Membership + interest combined"
              highlight
            />
            <RevenueCard
              label="Membership Revenue"
              value={formatCurrency(revenue.membershipRevenue)}
              icon={<CreditCard size={16} />}
              iconBg="bg-[#ecfdf5]"
              iconColor="text-[#059669]"
              sub="From membership plan payments"
            />
            <RevenueCard
              label="Interest Revenue"
              value={formatCurrency(revenue.interestRevenue)}
              icon={<CircleDollarSign size={16} />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              sub="From salary advance interest"
            />
          </div>

          {/* Breakdown */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <p className="text-[13px] font-[600] text-slate-900">Revenue Breakdown</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Membership revenue", value: revenue.membershipRevenue, color: "#059669" },
                { label: "Interest revenue",   value: revenue.interestRevenue,   color: "#059669" },
              ].map(({ label, value, color }) => {
                const total = Number(revenue.totalRevenue) || 1;
                const pct = Math.round((Number(value) / total) * 100);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-slate-600">{label}</span>
                      <span className="text-[12px] font-[600] text-slate-800">
                        {formatCurrency(value)}
                        <span className="text-[11px] font-[400] text-slate-400 ml-1.5">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
