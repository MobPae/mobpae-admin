import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Users, UserCheck, UserMinus, Smartphone, Search } from "lucide-react";
import { getEmployees } from "../services/employeeService";
import type { Employee, EmploymentStatus } from "../types/employee";
import EmployeesTable from "../components/employees/EmployeesTable";
import EmployeeDrawer from "../components/employees/EmployeeDrawer";
import { exportToCsv } from "../utils/exportCsv";

const P = "var(--color-brand)";

export default function EmployeesPage() {
  const { data: employees = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmploymentStatus>("ALL");
  const [employerFilter, setEmployerFilter] = useState("ALL");
  const [selected, setSelected] = useState<Employee | null>(null);

  const employers = [...new Map(employees.map((e) => [e.employer.id, e.employer])).values()];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || e.employmentStatus === statusFilter;
    const matchEmployer = employerFilter === "ALL" || e.employer.id === employerFilter;
    return matchSearch && matchStatus && matchEmployer;
  });

  const counts = {
    total:    employees.length,
    active:   employees.filter((e) => e.employmentStatus === "ACTIVE").length,
    inactive: employees.filter((e) => e.employmentStatus === "INACTIVE").length,
    app:      employees.filter((e) => e.appActivated).length,
  };

  const kpis = [
    { label: "Total Employees", value: counts.total,    icon: <Users size={18} color={P} strokeWidth={1.75} />,             bg: "var(--color-brand-soft)", filter: null as EmploymentStatus | null },
    { label: "Active",          value: counts.active,   icon: <UserCheck size={18} color="var(--color-success)" strokeWidth={1.75} />,   bg: "var(--color-success-bg)", filter: "ACTIVE" as EmploymentStatus    },
    { label: "Inactive",        value: counts.inactive, icon: <UserMinus size={18} color="#EF4444" strokeWidth={1.75} />,   bg: "var(--color-danger-bg)", filter: "INACTIVE" as EmploymentStatus  },
    { label: "App Activated",   value: counts.app,      icon: <Smartphone size={18} color="var(--color-warning)" strokeWidth={1.75} />,  bg: "var(--color-warning-bg)", filter: null                            },
  ];

  const handleExport = () => {
    exportToCsv(
      filtered.map(e => ({
        "Name": e.name, "Code": e.employeeCode, "Email": e.email,
        "Employer": e.employer.companyName, "Status": e.employmentStatus,
      })),
      "employees"
    );
  };

  const statusTabs = [
    { label: "All",      value: "ALL" as const,      count: employees.length   },
    { label: "Active",   value: "ACTIVE" as const,   count: counts.active      },
    { label: "Inactive", value: "INACTIVE" as const, count: counts.inactive    },
  ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>

      {/* ── Header ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Employees</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Manage employee accounts across all employers.</p>
        </div>
        <button
          onClick={handleExport}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {isError && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Could not load employees. Check that the backend is running.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Try again</button>
        </div>
      )}

      {/* ── KPI cards ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={() => kpi.filter && setStatusFilter(statusFilter === kpi.filter ? "ALL" : kpi.filter)}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 240 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search name, email, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <select
          value={employerFilter}
          onChange={(e) => setEmployerFilter(e.target.value)}
          style={{ height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 13, color: "var(--color-ink-3)", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          <option value="ALL">All employers</option>
          {employers.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.companyName}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          {statusTabs.map(tab => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  height: 36, padding: "0 14px",
                  background: active ? "var(--color-ink)" : "white",
                  color: active ? "white" : "var(--color-ink-3)",
                  border: `1px solid ${active ? "var(--color-ink)" : "var(--color-edge)"}`,
                  borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{tab.count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, color: "var(--color-ink-3)", cursor: "pointer", fontFamily: "inherit" }}>
          <Filter size={13} />
          More Filters
        </button>
        <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}>{filtered.length} employees</span>
      </div>

      {/* ── Table ───────────────────────────── */}
      {isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
              </div>
              <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 72 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", padding: "60px 24px", textAlign: "center" }}>
          <Users size={36} style={{ color: "var(--color-edge)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>No employees found</p>
          <p style={{ fontSize: 13, color: "var(--color-ink-4)", marginTop: 6 }}>
            {search || statusFilter !== "ALL" || employerFilter !== "ALL"
              ? "Try adjusting your search or filters."
              : "No employees onboarded yet."}
          </p>
        </div>
      ) : (
        <EmployeesTable
          employees={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(emp) => setSelected(selected?.id === emp.id ? null : emp)}
        />
      )}

      <EmployeeDrawer
        open={selected !== null}
        employee={selected}
        onClose={() => setSelected(null)}
        onRefresh={() => void refetch()}
      />
    </div>
  );
}
