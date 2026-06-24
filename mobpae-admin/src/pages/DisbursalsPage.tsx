import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CreditCard, Clock, CheckCircle, XCircle, Calendar, X } from "lucide-react";
import { getDisbursals } from "../services/disbursalService";
import DisbursalsTable from "../components/disbursals/DisbursalsTable";
import DisbursalDrawer from "../components/disbursals/DisbursalDrawer";
import type { DisbursalStatus } from "../types/disbursal";
import type { Disbursal } from "../types/disbursal";

type FilterStatus = "ALL" | DisbursalStatus;

const STATUS_TABS: { key: FilterStatus; label: string }[] = [
  { key: "ALL",       label: "All"       },
  { key: "PENDING",   label: "Pending"   },
  { key: "DISBURSED", label: "Disbursed" },
  { key: "FAILED",    label: "Failed"    },
];

export default function DisbursalsPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [selected, setSelected] = useState<Disbursal | null>(null);

  const serverFilters = {
    ...(filter !== "ALL" ? { status: filter as DisbursalStatus } : {}),
    ...(dateFrom ? { startDate: dateFrom } : {}),
    ...(dateTo   ? { endDate: dateTo }     : {}),
  };

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["disbursals", serverFilters],
    queryFn: () => getDisbursals(serverFilters),
  });

  const pending   = data.filter(d => d.status === "PENDING").length;
  const disbursed = data.filter(d => d.status === "DISBURSED").length;
  const failed    = data.filter(d => d.status === "FAILED").length;
  const total     = data.length;

  const rows = data.filter(d => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.salaryRequest.employee.name.toLowerCase().includes(q) ||
      d.salaryRequest.employee.employeeCode.toLowerCase().includes(q) ||
      d.salaryRequest.employee.employer.companyName.toLowerCase().includes(q)
    );
  });

  const counts: Record<FilterStatus, number> = { ALL: total, PENDING: pending, DISBURSED: disbursed, FAILED: failed };

  const kpis = [
    { icon: <Clock size={18} color="#D97706" strokeWidth={1.75} />,       iconBg: "#FEF3C7", label: "Pending",   val: pending   },
    { icon: <CheckCircle size={18} color="#16A34A" strokeWidth={1.75} />, iconBg: "#DCFCE7", label: "Disbursed", val: disbursed },
    { icon: <XCircle size={18} color="#EF4444" strokeWidth={1.75} />,     iconBg: "#FEE2E2", label: "Failed",    val: failed    },
    { icon: <CreditCard size={18} color="#6C4CFF" strokeWidth={1.75} />,  iconBg: "#F3F0FF", label: "Total",     val: total     },
  ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>

      {/* ── Header ──────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Disbursals</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Track and manage salary disbursals.</p>
      </div>

      {isError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#DC2626" }}>
          <span>Failed to load disbursals.</span>
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
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{rows.length} disbursals</span>
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
          <CreditCard size={36} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>No disbursals found</p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>
            {search || filter !== "ALL" || dateFrom || dateTo
              ? "Try adjusting your search or filters."
              : "Disbursals appear once salary requests are approved."}
          </p>
        </div>
      ) : (
        <DisbursalsTable
          disbursals={rows}
          selectedId={selected?.id ?? null}
          onSelect={d => setSelected(d)}
        />
      )}

      <DisbursalDrawer
        open={!!selected}
        disbursal={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          qc.invalidateQueries({ queryKey: ["disbursals"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
