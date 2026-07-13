import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, CreditCard, TrendingUp } from "lucide-react";
import { getRevenueSummary } from "../services/dashboardService";

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return fmt.format(Number.isFinite(n as number) ? (n as number) : 0);
};

function RevenueCard({ label, value, icon, iconBg, sub, highlight }: {
  label: string; value: string; icon: React.ReactNode;
  iconBg: string; sub?: string; highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div style={{ background: "linear-gradient(135deg, #2048EE 0%, #315eff 100%)", borderRadius: 16, padding: "14px 16px", border: "1px solid #2048EE", boxShadow: "0 4px 20px rgba(49,94,255,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "white" }}>{value}</div>
          <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--color-ink)" }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "var(--color-ink-3)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-ink-4)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const { data: revenue, isLoading, error, refetch } = useQuery({
    queryKey: ["revenue-summary"],
    queryFn: getRevenueSummary,
  });

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Platform revenue from memberships and interest.</p>
      </div>

      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 76, background: "white", border: "1px solid #E5E7EB", borderRadius: 16 }} className="animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 16, padding: "20px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-danger)", margin: 0 }}>Failed to load revenue data</p>
          <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error instanceof Error ? error.message : "Unknown error"}</p>
          <button type="button" onClick={() => void refetch()} style={{ marginTop: 12, height: 34, padding: "0 14px", borderRadius: 10, background: "white", border: "1px solid #FECACA", fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Try again</button>
        </div>
      )}

      {revenue && (
        <>
          {/* Revenue cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <RevenueCard
              label="Total Revenue"
              value={formatCurrency(revenue.totalRevenue)}
              icon={<TrendingUp size={18} color="white" strokeWidth={1.75} />}
              iconBg="rgba(255,255,255,0.15)"
              sub="Membership + interest combined"
              highlight
            />
            <RevenueCard
              label="Membership Revenue"
              value={formatCurrency(revenue.membershipRevenue)}
              icon={<CreditCard size={18} color="var(--color-brand)" strokeWidth={1.75} />}
              iconBg="var(--color-brand-soft)"
              sub="From membership plan payments"
            />
            <RevenueCard
              label="Interest Revenue"
              value={formatCurrency(revenue.interestRevenue)}
              icon={<CircleDollarSign size={18} color="var(--color-success)" strokeWidth={1.75} />}
              iconBg="var(--color-success-bg)"
              sub="From salary advance interest"
            />
          </div>

          {/* Breakdown */}
          <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Revenue Breakdown</p>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Membership revenue", value: revenue.membershipRevenue, color: "var(--color-brand)" },
                { label: "Interest revenue",   value: revenue.interestRevenue,   color: "var(--color-success)" },
              ].map(({ label, value, color }) => {
                const total = Number(revenue.totalRevenue) || 1;
                const pct = Math.round((Number(value) / total) * 100);
                return (
                  <div key={label}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "var(--color-ink-3)" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                        {formatCurrency(value)}
                        <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-ink-4)", marginLeft: 6 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--color-surface-muted)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, background: color, width: `${pct}%`, transition: "width 0.5s ease" }} />
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
