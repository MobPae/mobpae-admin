import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, CreditCard, Download } from "lucide-react";
import { getBankGroupedByEmployer } from "../services/bankVerificationService";
import type { BankVerificationFilter } from "../services/bankVerificationService";
import BankGroupedTable from "../components/bank-verification/BankGroupedTable";
import BankGroupedDrawer from "../components/bank-verification/BankGroupedDrawer";
import type { BankEmployerGroup } from "../types/bankAccount";
import { exportToCsv } from "../utils/exportCsv";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Pagination } from "../components/ui/Pagination";

const PAGE_SIZE = 15;

const CHIPS: { key: BankVerificationFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
];

export default function BankVerificationPage() {
  const [search,     setSearch]     = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter,     setFilter]     = useState<BankVerificationFilter>("ALL");
  const [page, setPage] = useState(1);
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
    const q = debouncedSearch.toLowerCase();
    return (
      g.companyName.toLowerCase().includes(q) ||
      g.companyCode.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Live drawer data
  const selectedGroup = useMemo(
    () => (selectedId ? data.find(g => g.employerId === selectedId) ?? null : null),
    [data, selectedId]
  );

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Bank Verification</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Review and verify employee bank accounts by employer.</p>
        </div>
        <button
          onClick={() => exportToCsv(rows.map(g => ({
            Employer: g.companyName,
            Code: g.companyCode,
            "Total Accounts": g.totalAccounts,
            Pending: g.pendingCount,
            Verified: g.verifiedCount,
          })), "bank-verification")}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24, marginTop: 24 }}>
        {[
          { icon: <Clock size={18} color="var(--color-warning)" strokeWidth={1.75} />,       iconBg: "var(--color-warning-bg)", label: "Pending",  val: pending  },
          { icon: <CheckCircle size={18} color="var(--color-success)" strokeWidth={1.75} />, iconBg: "var(--color-success-bg)", label: "Verified", val: verified },
          { icon: <CreditCard size={18} color="var(--color-brand)" strokeWidth={1.75} />,  iconBg: "var(--color-brand-soft)", label: "Total",    val: total    },
        ].map(({ icon, iconBg, label, val }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-edge)", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by employer name or code…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {CHIPS.map(c => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => { setFilter(c.key); setPage(1); }}
                style={{ height: 36, padding: "0 14px", background: active ? "var(--color-ink)" : "white", color: active ? "white" : "var(--color-ink-3)", border: `1px solid ${active ? "var(--color-ink)" : "var(--color-edge)"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {(search || filter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setFilter("ALL"); setPage(1); }}
            style={{ height: 36, padding: "0 14px", background: "white", border: "1px dashed var(--color-edge)", borderRadius: 10, fontSize: 13, color: "var(--color-ink-3)", cursor: "pointer", fontFamily: "inherit" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isError ? (
        <div style={{ background: "white", border: "1px solid var(--color-danger-bg)", borderRadius: 20, padding: "56px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-danger)", margin: 0 }}>Failed to load bank accounts</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>Check your connection and try again.</p>
          <button onClick={() => void refetch()} style={{ marginTop: 16, height: 34, padding: "0 16px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-canvas)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
                <div>
                  <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 90 }} className="animate-pulse" />
                </div>
                <div style={{ marginLeft: "auto", height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 70 }} className="animate-pulse" />
              </div>
              <div style={{ display: "flex", gap: 10, paddingLeft: 48 }}>
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 80 }} className="animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 20, padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18 }}>🏦</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-3)", margin: 0 }}>No employers found</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-4)", marginTop: 4 }}>
            {search ? "No employers match your search." : "No bank accounts match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}><span style={{ fontWeight: 500, color: "var(--color-ink-3)" }}>{rows.length}</span> employer{rows.length !== 1 ? "s" : ""}</span>
          </div>
          <BankGroupedTable
            groups={paginated}
            selectedId={selectedId}
            onSelect={g => setSelectedId(g.employerId)}
          />
          <Pagination page={safePage} totalPages={totalPages} total={rows.length} limit={PAGE_SIZE} onPage={setPage} />
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
