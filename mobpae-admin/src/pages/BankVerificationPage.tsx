import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, CreditCard } from "lucide-react";
import { getBankGroupedByEmployer } from "../services/bankVerificationService";
import type { BankVerificationFilter } from "../services/bankVerificationService";
import BankGroupedTable from "../components/bank-verification/BankGroupedTable";
import BankGroupedDrawer from "../components/bank-verification/BankGroupedDrawer";
import type { BankEmployerGroup } from "../types/bankAccount";

const CHIPS: { key: BankVerificationFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
];

export default function BankVerificationPage() {
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<BankVerificationFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryKey = ["bank-grouped", filter];

  const { data = [], isLoading, isError, refetch } = useQuery<BankEmployerGroup[]>({
    queryKey,
    queryFn: () => getBankGroupedByEmployer({ status: filter }),
  });

  // Aggregate stats
  const pending  = data.reduce((n, g) => n + g.pendingCount,  0);
  const verified = data.reduce((n, g) => n + g.verifiedCount, 0);
  const total    = data.reduce((n, g) => n + g.totalAccounts,  0);

  // Client-side search
  const rows = data.filter(g => {
    const q = search.toLowerCase();
    return (
      g.companyName.toLowerCase().includes(q) ||
      g.companyCode.toLowerCase().includes(q)
    );
  });

  // Live drawer data
  const selectedGroup = useMemo(
    () => (selectedId ? data.find(g => g.employerId === selectedId) ?? null : null),
    [data, selectedId]
  );

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Bank Verification</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Review and verify employee bank accounts by employer.</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24, marginTop: 24 }}>
        {[
          { icon: <Clock size={18} color="#D97706" strokeWidth={1.75} />,       iconBg: "#FEF3C7", label: "Pending",  val: pending  },
          { icon: <CheckCircle size={18} color="#16A34A" strokeWidth={1.75} />, iconBg: "#DCFCE7", label: "Verified", val: verified },
          { icon: <CreditCard size={18} color="#6C4CFF" strokeWidth={1.75} />,  iconBg: "#F3F0FF", label: "Total",    val: total    },
        ].map(({ icon, iconBg, label, val }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by employer name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "#111827", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {CHIPS.map(c => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                style={{ height: 36, padding: "0 14px", background: active ? "#111827" : "white", color: active ? "white" : "#6B7280", border: `1px solid ${active ? "#111827" : "#E5E7EB"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {(search || filter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setFilter("ALL"); }}
            style={{ height: 36, padding: "0 14px", background: "white", border: "1px dashed #E5E7EB", borderRadius: 10, fontSize: 13, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isError ? (
        <div style={{ background: "white", border: "1px solid #FEE2E2", borderRadius: 20, padding: "56px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#DC2626", margin: 0 }}>Failed to load bank accounts</p>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Check your connection and try again.</p>
          <button onClick={() => void refetch()} style={{ marginTop: 16, height: 34, padding: "0 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: "18px 24px", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F3F4F6", flexShrink: 0 }} className="animate-pulse" />
                <div>
                  <div style={{ height: 12, background: "#F3F4F6", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 90 }} className="animate-pulse" />
                </div>
                <div style={{ marginLeft: "auto", height: 22, background: "#F3F4F6", borderRadius: 999, width: 70 }} className="animate-pulse" />
              </div>
              <div style={{ display: "flex", gap: 10, paddingLeft: 48 }}>
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 100 }} className="animate-pulse" />
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 80 }} className="animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18 }}>🏦</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0 }}>No employers found</p>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            {search ? "No employers match your search." : "No bank accounts match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}><span style={{ fontWeight: 500, color: "#6B7280" }}>{rows.length}</span> employer{rows.length !== 1 ? "s" : ""}</span>
          </div>
          <BankGroupedTable
            groups={rows}
            selectedId={selectedId}
            onSelect={g => setSelectedId(g.employerId)}
          />
        </>
      )}

      <BankGroupedDrawer
        open={!!selectedGroup}
        group={selectedGroup}
        queryKey={queryKey}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
