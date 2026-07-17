import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Download, Plus, Search, UserCheck, AlertCircle, PauseCircle } from "lucide-react";
import EmployersTable from "../components/employers/EmployersTable";
import EmployerManagementDrawer from "../components/employers/EmployerManagementDrawer";
import CreateEmployerDrawer from "../components/employers/CreateEmployerDrawer";
import type { EmployerStatus } from "../types/employer";
import { getEmployers } from "../services/employerService";
import { exportToCsv } from "../utils/exportCsv";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Pagination } from "../components/ui/Pagination";

const P = "var(--color-brand)";
const PAGE_SIZE = 15;

const STATUS_TABS: { label: string; value: "ALL" | EmployerStatus }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Active",    value: "ACTIVE"    },
  { label: "Pending",   value: "PENDING"   },
  { label: "Approved",  value: "APPROVED"  },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Inactive",  value: "INACTIVE"  },
  { label: "Rejected",  value: "REJECTED"  },
];

export default function EmployersPage() {
  const queryClient = useQueryClient();

  const { data: employers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employers"],
    queryFn: getEmployers,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmployerStatus>("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => (selectedId ? employers.find((e) => e.id === selectedId) ?? null : null),
    [employers, selectedId]
  );
  const [showCreate, setShowCreate] = useState(false);

  const counts: Record<EmployerStatus, number> = {
    ACTIVE:    employers.filter((e) => e.status === "ACTIVE").length,
    PENDING:   employers.filter((e) => e.status === "PENDING").length,
    APPROVED:  employers.filter((e) => e.status === "APPROVED").length,
    REJECTED:  employers.filter((e) => e.status === "REJECTED").length,
    INACTIVE:  employers.filter((e) => e.status === "INACTIVE").length,
    SUSPENDED: employers.filter((e) => e.status === "SUSPENDED").length,
  };

  const filtered = employers.filter((e) => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.companyCode.toLowerCase().includes(q) ||
      e.contactPerson.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    exportToCsv(
      filtered.map(e => ({
        "Company": e.companyName, "Code": e.companyCode, "Contact": e.contactPerson,
        "Email": e.email, "Phone": e.phone, "Status": e.status, "Risk": e.riskStatus,
      })),
      "employers"
    );
  };

  const kpis = [
    { label: "Total Employers",    value: employers.length, icon: <Building2 size={18} color={P} strokeWidth={1.75} />,        bg: "var(--color-brand-soft)", filter: null as EmployerStatus | null },
    { label: "Active",             value: counts.ACTIVE,    icon: <UserCheck size={18} color="var(--color-success)" strokeWidth={1.75} />,   bg: "var(--color-success-bg)", filter: "ACTIVE" as EmployerStatus    },
    { label: "Pending Onboarding", value: counts.PENDING,   icon: <AlertCircle size={18} color="var(--color-warning)" strokeWidth={1.75} />, bg: "var(--color-warning-bg)", filter: "PENDING" as EmployerStatus   },
    { label: "Suspended",          value: counts.SUSPENDED, icon: <PauseCircle size={18} color="#EF4444" strokeWidth={1.75} />, bg: "var(--color-danger-bg)", filter: "SUSPENDED" as EmployerStatus  },
  ];

  return (
    <div style={{ padding: "28px 32px" }}>

      {/* ── Page header ─────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Employers</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Manage and monitor all partner organizations.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleExport}
            style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: P, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(49,94,255,0.25)" }}
          >
            <Plus size={14} />
            Add Employer
          </button>
        </div>
      </div>

      {isError && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Could not load employers. Check that the backend is running.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Try again</button>
        </div>
      )}

      {/* ── KPI cards ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={() => { if (kpi.filter) { setStatusFilter(statusFilter === kpi.filter ? "ALL" : kpi.filter); setPage(1); } }}
            style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: `1px solid ${kpi.filter && statusFilter === kpi.filter ? P : "var(--color-edge)"}`, boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14, cursor: kpi.filter ? "pointer" : "default" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1, opacity: isLoading ? 0.3 : 1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 3, fontWeight: 500 }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              style={{
                height: 36, padding: "0 14px",
                background: statusFilter === tab.value ? "var(--color-ink)" : "white",
                color: statusFilter === tab.value ? "white" : "var(--color-ink-3)",
                border: `1px solid ${statusFilter === tab.value ? "var(--color-ink)" : "var(--color-edge)"}`,
                borderRadius: 10, fontSize: 13, fontWeight: statusFilter === tab.value ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {tab.label}
              {tab.value !== "ALL" && counts[tab.value as EmployerStatus] !== undefined && (
                <span style={{ marginLeft: 6, opacity: 0.55, fontSize: 12 }}>
                  · {counts[tab.value as EmployerStatus]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}>{filtered.length} {filtered.length === 1 ? "employer" : "employers"}</span>
      </div>

      {/* ── Table ───────────────────────────── */}
      {isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--color-canvas)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 160, marginBottom: 6 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
              </div>
              <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 72 }} className="animate-pulse" />
              <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 80 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", padding: "60px 24px", textAlign: "center" }}>
          <Building2 size={36} style={{ color: "var(--color-edge)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>No employers found</p>
          <p style={{ fontSize: 13, color: "var(--color-ink-4)", marginTop: 6 }}>
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filter." : "No employers onboarded yet."}
          </p>
        </div>
      ) : (
        <>
          <EmployersTable
            employers={paginated}
            selectedId={selectedId}
            onSelect={(emp) => setSelectedId(selectedId === emp.id ? null : emp.id)}
          />
          <Pagination page={safePage} totalPages={totalPages} total={filtered.length} limit={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      <EmployerManagementDrawer
        open={selected !== null}
        employer={selected}
        onClose={() => setSelectedId(null)}
        onMutated={() => void queryClient.invalidateQueries({ queryKey: ["employers"] })}
      />

      <CreateEmployerDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
