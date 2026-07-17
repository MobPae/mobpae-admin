import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  Download,
  Receipt,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { getRevenueReport } from "../services/revenueService";
import type { RevenueEmployerBucket } from "../types/revenue";
import { exportToCsv } from "../utils/exportCsv";
import { Pagination } from "../components/ui/Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { avatarColor } from "../utils/avatarColor";

const PAGE_SIZE = 15;

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: number | null | undefined) => fmt.format(Number.isFinite(v as number) ? (v as number) : 0);

// ── summary card ──────────────────────────────────────────────────────────────

function RevenueCard({ label, value, icon, iconBg, sub, highlight, loading }: {
  label: string; value: string; icon: React.ReactNode;
  iconBg: string; sub?: string; highlight?: boolean; loading?: boolean;
}) {
  if (highlight) {
    return (
      <div style={{ background: "linear-gradient(135deg, var(--color-info) 0%, var(--color-brand) 100%)", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-info)", boxShadow: "0 4px 20px rgba(49,94,255,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "white", opacity: loading ? 0.4 : 1 }}>{value}</div>
          <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-edge)", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--color-ink)", opacity: loading ? 0.3 : 1 }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 3, fontWeight: 500, color: "var(--color-ink-3)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-ink-4)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── employer drawer ──────────────────────────────────────────────────────────

function EmployerRevenueDrawer({ employer, onClose }: { employer: RevenueEmployerBucket | null; onClose: () => void }) {
  if (!employer) return null;
  const first = employer.companyName.charAt(0).toUpperCase();
  const av = avatarColor(employer.companyName);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-[13px] font-[600] flex-shrink-0" style={{ background: av }}>
              {first}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-[600] text-ink leading-none truncate">{employer.companyName}</p>
              <p className="text-[11px] text-ink-3 mt-1 leading-none font-mono">{employer.companyCode} · {employer.employeeCount} employee{employer.employeeCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-3 hover:bg-surface-muted transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2.5 px-5 py-4 border-b border-edge flex-shrink-0">
          {[
            { label: "Interest",     value: employer.interestRevenue },
            { label: "Platform Fee", value: employer.platformFeeRevenue },
            { label: "Late Fees",    value: employer.lateFeeRevenue },
            { label: "Total",        value: employer.totalRevenue, strong: true },
          ].map(row => (
            <div key={row.label} className="bg-canvas rounded-lg px-3 py-2.5">
              <p className="text-[10.5px] text-ink-3 mb-1">{row.label}</p>
              <p className={`text-[14px] tabular-nums ${row.strong ? "font-[700] text-brand" : "font-[600] text-ink"}`}>{formatCurrency(row.value)}</p>
            </div>
          ))}
        </div>

        {/* Employees */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <p className="text-[11px] font-[600] text-ink-4 uppercase tracking-[0.07em]">Employee breakdown</p>
          </div>
          <div className="px-5 pb-2">
            <div className="flex items-start gap-2 bg-canvas border border-edge rounded-lg px-3 py-2">
              <AlertTriangle size={12} className="text-ink-4 mt-0.5 flex-shrink-0" />
              <p className="text-[10.5px] text-ink-3 leading-relaxed">Late fees are recorded at the employer level only, not per employee — employee rows always show ₹0 for late fees.</p>
            </div>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {employer.employees.map(e => (
              <div key={e.employeeId} className="border border-edge rounded-xl px-3.5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-[600] text-ink truncate">{e.name}</p>
                    <p className="text-[11px] text-ink-3 font-mono mt-0.5">{e.employeeCode}</p>
                  </div>
                  <p className="text-[13px] font-[700] text-ink tabular-nums flex-shrink-0">{formatCurrency(e.totalRevenue)}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-edge-2">
                  <div>
                    <p className="text-[10px] text-ink-4">Interest</p>
                    <p className="text-[11.5px] font-[500] text-ink-2 tabular-nums mt-0.5">{formatCurrency(e.interestRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-4">Platform Fee</p>
                    <p className="text-[11.5px] font-[500] text-ink-2 tabular-nums mt-0.5">{formatCurrency(e.platformFeeRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-4">Late Fee</p>
                    <p className="text-[11.5px] font-[500] text-ink-4 tabular-nums mt-0.5">—</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: revenue, isLoading, isError, refetch } = useQuery({
    queryKey: ["revenue-report", dateFrom, dateTo],
    queryFn: () => getRevenueReport({
      ...(dateFrom ? { startDate: dateFrom } : {}),
      ...(dateTo ? { endDate: dateTo } : {}),
    }),
  });

  const byEmployer = useMemo(() => revenue?.byEmployer ?? [], [revenue]);

  const filtered = useMemo(() => byEmployer.filter(e => {
    const q = debouncedSearch.toLowerCase();
    return !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.companyCode.toLowerCase().includes(q);
  }), [byEmployer, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedEmployer = selectedEmployerId
    ? byEmployer.find(e => e.employerId === selectedEmployerId) ?? null
    : null;

  const buckets = [
    { label: "Interest revenue",     value: revenue?.interestRevenue ?? 0,    color: "var(--color-success)" },
    { label: "Platform fee revenue", value: revenue?.platformFeeRevenue ?? 0, color: "var(--color-brand)" },
    { label: "Late fee revenue",     value: revenue?.lateFeeRevenue ?? 0,     color: "var(--color-warning)" },
  ];
  const totalForPct = revenue?.totalRevenue || 1;

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Revenue</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Realized platform revenue from interest, platform fees, and late fees.</p>
        </div>
        <button
          onClick={() => exportToCsv(filtered.map(e => ({
            Employer: e.companyName,
            Code: e.companyCode,
            Employees: e.employeeCount,
            Interest: e.interestRevenue,
            "Platform Fee": e.platformFeeRevenue,
            "Late Fee": e.lateFeeRevenue,
            Total: e.totalRevenue,
          })), "revenue-by-employer")}
          disabled={!filtered.length}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: filtered.length ? "pointer" : "not-allowed", opacity: filtered.length ? 1 : 0.5, fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {isError && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Failed to load revenue data.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      )}

      {/* Date range */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 240, flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employer name or code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={13} className="text-ink-4" />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, fontSize: 12.5, color: "var(--color-ink-3)", outline: "none", fontFamily: "inherit" }} />
          <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}>–</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, fontSize: 12.5, color: "var(--color-ink-3)", outline: "none", fontFamily: "inherit" }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-surface-muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-3)" }}>
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <RevenueCard
          label="Total Revenue"
          value={formatCurrency(revenue?.totalRevenue)}
          icon={<TrendingUp size={18} color="white" strokeWidth={1.75} />}
          iconBg="rgba(255,255,255,0.15)"
          sub="Interest + platform fee + late fees"
          loading={isLoading}
          highlight
        />
        <RevenueCard
          label="Interest Revenue"
          value={formatCurrency(revenue?.interestRevenue)}
          icon={<CircleDollarSign size={18} color="var(--color-success)" strokeWidth={1.75} />}
          iconBg="var(--color-success-bg)"
          sub="Paid repayment interest"
          loading={isLoading}
        />
        <RevenueCard
          label="Platform Fee Revenue"
          value={formatCurrency(revenue?.platformFeeRevenue)}
          icon={<Receipt size={18} color="var(--color-brand)" strokeWidth={1.75} />}
          iconBg="var(--color-brand-soft)"
          sub="Paid per-advance platform fees"
          loading={isLoading}
        />
        <RevenueCard
          label="Late Fee Revenue"
          value={formatCurrency(revenue?.lateFeeRevenue)}
          icon={<AlertTriangle size={18} color="var(--color-warning)" strokeWidth={1.75} />}
          iconBg="var(--color-warning-bg)"
          sub="Paid employer settlement late fees"
          loading={isLoading}
        />
      </div>

      {/* Breakdown */}
      <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-edge)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Revenue Breakdown</p>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {buckets.map(({ label, value, color }) => {
            const pct = Math.round((value / totalForPct) * 100);
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

      {/* Employer table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Revenue by Employer</p>
        <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}>{filtered.length} employer{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--color-canvas)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 160, marginBottom: 6 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
              </div>
              <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 80 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : !isError && filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", padding: "60px 24px", textAlign: "center" }}>
          <Users size={36} style={{ color: "var(--color-edge)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>No revenue found</p>
          <p style={{ fontSize: 13, color: "var(--color-ink-4)", marginTop: 6 }}>
            {search || dateFrom || dateTo ? "Try adjusting your search or date range." : "Revenue appears once platform fees, interest, or late fees are paid."}
          </p>
        </div>
      ) : !isError && (
        <>
          <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
                    {["Employer", "Employees", "Interest", "Platform Fee", "Late Fee", "Total", ""].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(e => {
                    const first = e.companyName.charAt(0).toUpperCase();
                    const av = avatarColor(e.companyName);
                    return (
                      <tr
                        key={e.employerId}
                        onClick={() => setSelectedEmployerId(e.employerId)}
                        style={{ borderBottom: "1px solid var(--color-canvas)", cursor: "pointer" }}
                      >
                        <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: av, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{first}</div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{e.companyName}</p>
                              <p style={{ fontSize: 11, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{e.companyCode}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "var(--color-ink-3)", fontVariantNumeric: "tabular-nums" }}>{e.employeeCount}</td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "var(--color-ink-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.interestRevenue)}</td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "var(--color-ink-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.platformFeeRevenue)}</td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "var(--color-ink-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.lateFeeRevenue)}</td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", fontWeight: 700, color: "var(--color-ink)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.totalRevenue)}</td>
                        <td style={{ padding: "14px 20px", verticalAlign: "middle", textAlign: "right" }}>
                          <ChevronRight size={14} color="var(--color-ink-4)" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={safePage} totalPages={totalPages} total={filtered.length} limit={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      <EmployerRevenueDrawer employer={selectedEmployer} onClose={() => setSelectedEmployerId(null)} />
    </div>
  );
}
