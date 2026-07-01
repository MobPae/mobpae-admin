import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, Calendar, X, FileText, Zap, CheckCircle, RefreshCw } from "lucide-react";
import { exportToCsv } from "../utils/exportCsv";
import { getSalaryRequests } from "../services/salaryRequestService";
import type { SalaryRequest, SalaryRequestStatus } from "../types/salary-request";
import SalaryRequestsTable from "../components/salary-requests/SalaryRequestsTable";
import SalaryRequestDrawer from "../components/salary-requests/SalaryRequestDrawer";
import { Pagination } from "../components/ui/Pagination";

const PAGE_SIZE = 15;

const NEEDS_ACTION_STATUSES: SalaryRequestStatus[] = ["EMPLOYER_APPROVED", "AWAITING_MEMBERSHIP_PAYMENT", "READY_FOR_DISBURSAL"];

const STATUS_LABELS: Record<SalaryRequestStatus, string> = {
  SUBMITTED:                   "Submitted",
  EMPLOYER_APPROVED:           "Employer approved",
  EMPLOYER_REJECTED:           "Rejected",
  AWAITING_MEMBERSHIP_PAYMENT: "Awaiting membership",
  READY_FOR_DISBURSAL:         "Ready for disbursal",
  DISBURSED:                   "Disbursed",
  REPAYMENT_SCHEDULED:         "Payment scheduled",
  REPAID:                      "Repaid",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as SalaryRequestStatus[];

export default function SalaryRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"ALL" | "NEEDS_ACTION" | SalaryRequestStatus>("ALL");
  const [selected, setSelected]           = useState<SalaryRequest | null>(null);
  const [page, setPage]                   = useState(1);
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo,   setDateTo]             = useState("");

  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length;
    return acc;
  }, {});
  const needsActionCount = NEEDS_ACTION_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.employee.name.toLowerCase().includes(q) ||
      r.employee.employeeCode.toLowerCase().includes(q) ||
      r.employee.employer.companyName.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "ALL"          ? true :
      statusFilter === "NEEDS_ACTION" ? NEEDS_ACTION_STATUSES.includes(r.status) :
      r.status === statusFilter;
    const created = r.createdAt ? new Date(r.createdAt) : null;
    const matchFrom = !dateFrom || (created !== null && created >= new Date(dateFrom));
    const matchTo   = !dateTo   || (created !== null && created <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const P = "#6C4CFF";
  const total = requests.length;

  const kpis = [
    { label: "Total Requests", value: total,                                                              icon: <FileText size={18} color={P} strokeWidth={1.75} />,            iconBg: "#F3F0FF" },
    { label: "Needs Action",   value: needsActionCount,                                                   icon: <Zap size={18} color="#D97706" strokeWidth={1.75} />,            iconBg: "#FEF3C7" },
    { label: "Disbursed",      value: counts["DISBURSED"] ?? 0,                                           icon: <CheckCircle size={18} color="#16A34A" strokeWidth={1.75} />,    iconBg: "#DCFCE7" },
    { label: "Repaid",         value: (counts["REPAID"] ?? 0) + (counts["REPAYMENT_SCHEDULED"] ?? 0),    icon: <RefreshCw size={18} color="#2563EB" strokeWidth={1.75} />,       iconBg: "#DBEAFE" },
  ];

  const STATUS_TABS = [
    { label: "All",           value: "ALL" as const           },
    { label: "Needs Action",  value: "NEEDS_ACTION" as const  },
    { label: "Submitted",     value: "SUBMITTED" as const     },
    { label: "Emp. Approved", value: "EMPLOYER_APPROVED" as const },
    { label: "Awaiting Mbr", value: "AWAITING_MEMBERSHIP_PAYMENT" as const },
    { label: "Ready",         value: "READY_FOR_DISBURSAL" as const },
    { label: "Disbursed",     value: "DISBURSED" as const     },
    { label: "Repaying",      value: "REPAYMENT_SCHEDULED" as const },
    { label: "Repaid",        value: "REPAID" as const        },
  ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>

      {/* ── Header ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Salary Advances</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Review and process employee salary advance requests.</p>
        </div>
        <button
          onClick={() => exportToCsv(filtered.map(r => ({
            Employee: r.employee?.name ?? "", Code: r.employee?.employeeCode ?? "",
            Company: r.employee?.employer?.companyName ?? "", Amount: r.amount,
            Status: r.status, Date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
          })), "salary-requests")}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {isError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#DC2626" }}>
          <span>Failed to load salary requests.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      )}

      {/* ── KPI cards ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: kpi.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1, opacity: isLoading ? 0.3 : 1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3, fontWeight: 500 }}>{kpi.label}</div>
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
            placeholder="Search employee, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "#111827", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_TABS.map(tab => {
            const active = statusFilter === tab.value;
            const cnt = tab.value === "ALL" ? requests.length : tab.value === "NEEDS_ACTION" ? needsActionCount : (counts[tab.value as SalaryRequestStatus] ?? 0);
            return (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                style={{
                  height: 36, padding: "0 14px",
                  background: active ? "#111827" : "white",
                  color: active ? "white" : "#6B7280",
                  border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
                  borderRadius: 10, fontSize: 12.5, fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{cnt}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <Calendar size={13} style={{ color: "#9CA3AF" }} />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12.5, color: "#6B7280", outline: "none", fontFamily: "inherit" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>–</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            style={{ height: 36, padding: "0 10px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 12.5, color: "#6B7280", outline: "none", fontFamily: "inherit" }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              style={{ width: 24, height: 24, borderRadius: "50%", background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              <X size={10} />
            </button>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{filtered.length} requests</span>
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
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", padding: "60px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>No requests found</p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filter." : "No salary requests submitted yet."}
          </p>
        </div>
      ) : (
        <>
          <SalaryRequestsTable
            requests={paginated}
            selectedId={selected?.id ?? null}
            onSelect={(r) => setSelected(selected?.id === r.id ? null : r)}
          />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPage={setPage}
          />
        </>
      )}

      <SalaryRequestDrawer
        open={selected !== null}
        request={selected}
        onClose={() => setSelected(null)}
        onMutated={() => {
          void queryClient.invalidateQueries({ queryKey: ["salary-requests"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
