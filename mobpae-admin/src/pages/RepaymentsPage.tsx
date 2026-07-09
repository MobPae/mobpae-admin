import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Calendar, CheckCircle, AlertTriangle, DollarSign, X, Download, RefreshCw } from "lucide-react";
import { getRepayments } from "../services/repaymentService";
import { exportToCsv } from "../utils/exportCsv";
import RepaymentsTable from "../components/repayments/RepaymentsTable";
import RepaymentDrawer from "../components/repayments/RepaymentDrawer";
import type { Repayment, RepaymentStatus } from "../types/repayment";

type FilterStatus = "ALL" | RepaymentStatus;

const STATUS_TABS: { key: FilterStatus; label: string }[] = [
  { key: "ALL",       label: "All"       },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "PAID",      label: "Paid"      },
  { key: "OVERDUE",   label: "Overdue"   },
];

export default function RepaymentsPage() {
  const queryClient = useQueryClient();

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("ALL");
  const [selected, setSelected] = useState<Repayment | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["repayments"],
    queryFn: getRepayments,
  });

  const scheduled = data.filter(r => r.status === "SCHEDULED").length;
  const paid      = data.filter(r => r.status === "PAID").length;
  const overdue   = data.filter(r => r.status === "OVERDUE").length;
  const total     = data.length;

  const counts: Record<FilterStatus, number> = { ALL: total, SCHEDULED: scheduled, PAID: paid, OVERDUE: overdue };

  const rows = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.loanApplication.employee.name.toLowerCase().includes(q) ||
      r.loanApplication.employee.employeeCode.toLowerCase().includes(q) ||
      r.loanApplication.employee.employer.companyName.toLowerCase().includes(q);
    const matchFilter = filter === "ALL" || r.status === filter;
    const due = r.dueDate ? new Date(r.dueDate) : null;
    const matchFrom = !dateFrom || (due !== null && due >= new Date(dateFrom));
    const matchTo   = !dateTo   || (due !== null && due <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchFilter && matchFrom && matchTo;
  });

  const kpis = [
    { icon: <RefreshCw size={18} color="#315eff" strokeWidth={1.75} />,       iconBg: "#EEF2FF", label: "Scheduled", val: scheduled },
    { icon: <CheckCircle size={18} color="#16A34A" strokeWidth={1.75} />,     iconBg: "#DCFCE7", label: "Paid",      val: paid      },
    { icon: <AlertTriangle size={18} color="#EF4444" strokeWidth={1.75} />,   iconBg: "#FEE2E2", label: "Overdue",   val: overdue   },
    { icon: <DollarSign size={18} color="#D97706" strokeWidth={1.75} />,      iconBg: "#FEF3C7", label: "Total",     val: total     },
  ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>

      {/* ── Header ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Repayments</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Track employee salary advance repayments.</p>
        </div>
        <button
          onClick={() => exportToCsv(rows.map(r => ({
            Employee:  r.loanApplication.employee.name,
            Code:      r.loanApplication.employee.employeeCode,
            Company:   r.loanApplication.employee.employer.companyName,
            Principal: r.principalAmount,
            Total:     r.totalAmount,
            DueDate:   r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "",
            PaidDate:  r.paidDate ? new Date(r.paidDate).toLocaleDateString() : "",
            Status:    r.status,
          })), `repayments`)}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {isError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#DC2626" }}>
          <span>Failed to load repayments.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      )}

      {/* ── KPI cards ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map(({ icon, iconBg, label, val }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1, opacity: isLoading ? 0.3 : 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search name, code, employer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "#111827", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map(tab => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  height: 36, padding: "0 14px",
                  background: active ? "#111827" : "white",
                  color: active ? "white" : "#6B7280",
                  border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
                  borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{counts[tab.key]}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={13} style={{ color: "#9CA3AF" }} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12.5, color: "#6B7280", outline: "none", fontFamily: "inherit" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>–</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12.5, color: "#6B7280", outline: "none", fontFamily: "inherit" }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }}
              style={{ width: 24, height: 24, borderRadius: "50%", background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              <X size={10} />
            </button>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{rows.length} repayments</span>
      </div>

      {/* ── Table ───────────────────────────── */}
      {isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F3F4F6", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "#F3F4F6", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 100 }} className="animate-pulse" />
              </div>
              <div style={{ height: 22, background: "#F3F4F6", borderRadius: 999, width: 80 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", padding: "60px 24px", textAlign: "center" }}>
          <RefreshCw size={36} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>No repayments found</p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>
            {search || filter !== "ALL" || dateFrom || dateTo
              ? "Try adjusting your search or filters."
              : "Repayments appear once salary advances are disbursed."}
          </p>
        </div>
      ) : (
        <RepaymentsTable
          repayments={rows}
          selectedId={selected?.id ?? null}
          onSelect={r => setSelected(r)}
        />
      )}

      <RepaymentDrawer
        open={!!selected}
        repayment={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          void queryClient.invalidateQueries({ queryKey: ["repayments"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
