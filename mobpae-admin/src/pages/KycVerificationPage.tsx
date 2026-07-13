import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, XCircle, FileText, ChevronDown } from "lucide-react";
import { getKycGrouped } from "../services/kycService";
import KycGroupedTable from "../components/kyc/KycGroupedTable";
import KycGroupedDrawer from "../components/kyc/KycGroupedDrawer";
import type { KycEmployeeGroup } from "../types/kyc";

type StatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
  { key: "REJECTED", label: "Rejected" },
];

export default function KycVerificationPage() {
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState<StatusFilter>("ALL");
  const [employerId, setEmployerId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryKey = ["kyc-grouped", employerId, status];

  const { data = [], isLoading, isError, refetch } = useQuery<KycEmployeeGroup[]>({
    queryKey,
    queryFn: () =>
      getKycGrouped({
        ...(employerId ? { employerId } : {}),
        ...(status !== "ALL" ? { status } : {}),
      }),
  });

  // Derive employer list for filter dropdown
  const employers = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(g => {
      if (g.employerId) map.set(g.employerId, g.companyName);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  // Stats from the full dataset
  const pending  = data.reduce((n, g) => n + g.pendingCount,  0);
  const verified = data.reduce((n, g) => n + g.verifiedCount, 0);
  const rejected = data.reduce((n, g) => n + g.rejectedCount, 0);
  const total    = data.reduce((n, g) => n + g.submittedCount, 0);

  // Client-side search filter
  const rows = data.filter(g => {
    const q = search.toLowerCase();
    return (
      g.employeeName.toLowerCase().includes(q) ||
      g.employeeCode.toLowerCase().includes(q) ||
      g.companyName.toLowerCase().includes(q)
    );
  });

  // Keep drawer data live — re-derives whenever query refreshes
  const selectedGroup = useMemo(
    () => (selectedId ? data.find(g => g.employeeId === selectedId) ?? null : null),
    [data, selectedId]
  );

  return (
    <div style={{ padding: "28px 32px" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>KYC Verification</h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Review and approve employee KYC documents</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24, marginTop: 24 }}>
        {[
          { icon: <Clock size={18} color="var(--color-warning)" strokeWidth={1.75} />,       iconBg: "var(--color-warning-bg)", label: "Pending",    val: pending  },
          { icon: <CheckCircle size={18} color="var(--color-success)" strokeWidth={1.75} />, iconBg: "var(--color-success-bg)", label: "Verified",   val: verified },
          { icon: <XCircle size={18} color="#EF4444" strokeWidth={1.75} />,     iconBg: "var(--color-danger-bg)", label: "Rejected",   val: rejected },
          { icon: <FileText size={18} color="var(--color-brand)" strokeWidth={1.75} />,    iconBg: "var(--color-brand-soft)", label: "Total Docs", val: total    },
        ].map(({ icon, iconBg, label, val }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name, code, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* Employer filter */}
        {employers.length > 0 && (
          <div style={{ position: "relative" }}>
            <select
              value={employerId}
              onChange={e => setEmployerId(e.target.value)}
              style={{ height: 40, padding: "0 28px 0 12px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 13.5, color: "var(--color-ink-3)", outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
            >
              <option value="">All employers</option>
              {employers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-ink-4)", pointerEvents: "none" }} />
          </div>
        )}

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_CHIPS.map(c => {
            const active = status === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setStatus(c.key)}
                style={{ height: 36, padding: "0 14px", background: active ? "var(--color-ink)" : "white", color: active ? "white" : "var(--color-ink-3)", border: `1px solid ${active ? "var(--color-ink)" : "var(--color-edge)"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        {(search || employerId || status !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setEmployerId(""); setStatus("ALL"); }}
            style={{ height: 36, padding: "0 14px", background: "white", border: "1px dashed #E5E7EB", borderRadius: 10, fontSize: 13, color: "var(--color-ink-3)", cursor: "pointer", fontFamily: "inherit" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table / empty states */}
      {isError ? (
        <div style={{ background: "white", border: "1px solid #FEE2E2", borderRadius: 20, padding: "56px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-danger)", margin: 0 }}>Failed to load KYC data</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 4 }}>Check your connection and try again.</p>
          <button onClick={() => void refetch()} style={{ marginTop: 16, height: 34, padding: "0 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
              </div>
              <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 80 }} className="animate-pulse" />
              <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 60 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18 }}>🪪</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-3)", margin: 0 }}>No employees found</p>
          <p style={{ fontSize: 12, color: "var(--color-ink-4)", marginTop: 4 }}>
            {search ? "No employees match your search." : "No KYC submissions match the selected filters."}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}><span style={{ fontWeight: 500, color: "var(--color-ink-3)" }}>{rows.length}</span> employee{rows.length !== 1 ? "s" : ""}</span>
          </div>
          <KycGroupedTable
            groups={rows}
            selectedId={selectedId}
            onSelect={g => setSelectedId(g.employeeId)}
          />
        </>
      )}

      <KycGroupedDrawer
        open={!!selectedGroup}
        group={selectedGroup}
        groupQueryKey={queryKey}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
