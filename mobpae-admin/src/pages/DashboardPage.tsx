import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { getAdminDashboard } from "../services/dashboardService";
import { getSalaryRequests } from "../services/salaryRequestService";
import { getEmployers } from "../services/employerService";
import { getAuditLogs } from "../services/auditService";
import { getTokenName } from "../utils/auth";
import type { AdminDashboard } from "../types/dashboard";
import type { SalaryRequest } from "../types/salary-request";

const EMPTY_DASHBOARD: AdminDashboard = {
  totalEmployers: 0,
  activeEmployers: 0,
  pendingEmployers: 0,
  totalEmployees: 0,
  activeEmployees: 0,
  pendingKycDocuments: 0,
  pendingBankAccounts: 0,
  pendingSalaryRequests: 0,
  pendingDisbursals: 0,
  disbursedAmount: 0,
  recoveredAmount: 0,
  outstandingAmount: 0,
  pendingSettlements: 0,
  membershipRevenue: 0,
  activeMemberships: 0,
  activeRepayments: 0,
};

type SRStatus = SalaryRequest["status"];

function srStatusLabel(s: SRStatus) {
  const map: Record<SRStatus, string> = {
    SUBMITTED: "Pending",
    EMPLOYER_APPROVED: "Approved",
    READY_FOR_DISBURSAL: "Ready",
    DISBURSED: "Disbursed",
    EMPLOYER_REJECTED: "Rejected",
    REPAYMENT_SCHEDULED: "Recovery",
    REPAID: "Repaid",
    AWAITING_MEMBERSHIP_PAYMENT: "",
  };
  return map[s];
}

function srStatusStyle(s: SRStatus): { bg: string; text: string } {
  const map: Record<SRStatus, { bg: string; text: string }> = {
    SUBMITTED: { bg: "#FEF3C7", text: "#D97706" },
    EMPLOYER_APPROVED: { bg: "#DBEAFE", text: "#1D4ED8" },
    READY_FOR_DISBURSAL: { bg: "#DCFCE7", text: "#16A34A" },
    DISBURSED: { bg: "#DCFCE7", text: "#15803D" },
    EMPLOYER_REJECTED: { bg: "#FEE2E2", text: "#DC2626" },
    REPAYMENT_SCHEDULED: { bg: "#FEF3C7", text: "#B45309" },
    REPAID: { bg: "#DCFCE7", text: "#166534" },
    AWAITING_MEMBERSHIP_PAYMENT: {
      bg: "#8B0000",
      text: "#D97706",
    },
  };
  return map[s];
}

function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function KpiCard({
  label,
  value,
  icon,
  iconBg,
  loading,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "14px 16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(17,24,39,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: accent ? "#D97706" : "#111827",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            opacity: loading ? 0.2 : 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginTop: 3,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

type SRTab = "PENDING" | "APPROVED" | "DISBURSED" | "ALL";
const SR_TABS: { key: SRTab; label: string; status?: SRStatus | SRStatus[] }[] =
  [
    { key: "PENDING", label: "Pending", status: "SUBMITTED" },
    { key: "APPROVED", label: "Approved", status: "EMPLOYER_APPROVED" },
    { key: "DISBURSED", label: "Disbursed Today", status: "DISBURSED" },
    { key: "ALL", label: "All Advances" },
  ];

export default function DashboardPage() {
  const navigate = useNavigate();
  const adminName = getTokenName() ?? "Admin";
  const firstName = adminName.split(" ")[0];

  const [srTab, setSrTab] = React.useState<SRTab>("ALL");

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
  });

  const { data: salaryRequests = [], isLoading: srLoading } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: getSalaryRequests,
  });

  const { data: employers = [], isLoading: empLoading } = useQuery({
    queryKey: ["employers"],
    queryFn: getEmployers,
  });

  const { data: auditLogsData } = useQuery({
    queryKey: ["audit-logs", "recent"],
    queryFn: () => getAuditLogs({ limit: 5, page: 1 }),
  });
  const recentAuditLogs = auditLogsData?.data ?? [];

  const d = dashboard ?? EMPTY_DASHBOARD;

  const sorted = [...salaryRequests].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );

  const pendingSR = sorted.filter((r) => r.status === "SUBMITTED");
  const approvedSR = sorted.filter((r) => r.status === "EMPLOYER_APPROVED");
  const disbursedSR = sorted.filter((r) => r.status === "DISBURSED");

  const displayedRequests = (() => {
    switch (srTab) {
      case "PENDING":
        return pendingSR.slice(0, 5);
      case "APPROVED":
        return approvedSR.slice(0, 5);
      case "DISBURSED":
        return disbursedSR.slice(0, 5);
      case "ALL":
        return sorted.slice(0, 5);
    }
  })();

  const tabCount = {
    PENDING: pendingSR.length,
    APPROVED: approvedSR.length,
    DISBURSED: disbursedSR.length,
    ALL: sorted.length,
  };

  const totalAttention =
    d.pendingSalaryRequests + d.pendingKycDocuments + d.pendingDisbursals;

  const kpis = [
    {
      label: "Disbursed Today",
      value: fmt(d.disbursedAmount),
      iconBg: "#F3F0FF",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6C4CFF"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      label: "Advances Processed",
      value: d.activeRepayments || 0,
      iconBg: "#DCFCE7",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
    {
      label: "Repayment Health",
      value:
        d.recoveredAmount + d.outstandingAmount > 0
          ? `${(
              (d.recoveredAmount / (d.recoveredAmount + d.outstandingAmount)) *
              100
            ).toFixed(1)}%`
          : dashLoading
          ? "—"
          : "N/A",
      iconBg: "#DCFCE7",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Items Need Attention",
      value: totalAttention || d.pendingSalaryRequests,
      iconBg: "#FEF3C7",
      accent: totalAttention > 0,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D97706"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  ];

  const queueItems = [
    {
      label: "KYC Reviews",
      sub: "Pending verification",
      count: d.pendingKycDocuments,
      to: "/kyc",
      color: "#6C4CFF",
    },
    {
      label: "Salary Advances",
      sub: "Awaiting approval",
      count: d.pendingSalaryRequests,
      to: "/salary-requests",
      color: "#F59E0B",
    },
    {
      label: "Failed Settlements",
      sub: "Action required",
      count: d.pendingSettlements,
      to: "/settlements",
      color: "#EF4444",
    },
    {
      label: "Employer Approvals",
      sub: "Awaiting activation",
      count: d.pendingEmployers,
      to: "/employers",
      color: "#6C4CFF",
    },
  ];

  const topEmployers = employers.slice(0, 4);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100%",
        fontFamily: "Inter, ui-sans-serif, sans-serif",
      }}
    >
      {/* ── Page header ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {getGreeting()}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>
            Here's what's happening with MobPae today.
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 38,
            padding: "0 14px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            fontSize: 13,
            color: "#374151",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <CalendarDays size={14} style={{ color: "#9CA3AF" }} />
          {today}
          <ChevronDown size={13} style={{ color: "#9CA3AF" }} />
        </button>
      </div>

      {/* ── KPI cards ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} loading={dashLoading} />
        ))}
      </div>

      {/* ── Body grid ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 240px",
          gap: 24,
        }}
      >
        {/* ── Left: Today's Queue ───────────── */}
        <div>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid #F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Today's Queue
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#D97706",
                  background: "#FEF3C7",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                {queueItems.reduce((a, i) => a + i.count, 0)}
              </span>
            </div>
            <div>
              {queueItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => void navigate(item.to)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #F3F4F6",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FAFAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        margin: "2px 0 0",
                      }}
                    >
                      {item.sub}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      background: item.count > 0 ? "#FEF3C7" : "#F3F4F6",
                      color: item.count > 0 ? "#D97706" : "#9CA3AF",
                      borderRadius: 999,
                      padding: "2px 8px",
                    }}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ padding: "12px 20px" }}>
              <button
                onClick={() => void navigate("/salary-requests")}
                style={{
                  width: "100%",
                  height: 36,
                  background: "#F3F0FF",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6C4CFF",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                View all queue →
              </button>
            </div>
          </div>

          {/* Insights */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
              marginTop: 20,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Insights
              </span>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#6B7280",
                  background: "none",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                This Month <ChevronDown size={11} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
                  Total Disbursed
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {fmt(d.disbursedAmount)}
                </p>
                {/* Sparkline placeholder */}
                <div
                  style={{
                    marginTop: 8,
                    height: 36,
                    background: "#F3F0FF",
                    borderRadius: 8,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <svg
                    viewBox="0 0 200 36"
                    style={{ width: "100%", height: "100%" }}
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,28 40,22 80,30 120,14 160,18 200,8"
                      fill="none"
                      stroke="#6C4CFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
                  Active Employees
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {d.activeEmployees.toLocaleString("en-IN")}
                </p>
                <div
                  style={{
                    marginTop: 8,
                    height: 36,
                    background: "#DCFCE7",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <svg
                    viewBox="0 0 200 36"
                    style={{ width: "100%", height: "100%" }}
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,30 40,26 80,20 120,22 160,12 200,8"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Salary Advances ───────── */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px 0",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Salary Advances
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: 32,
                    padding: "0 12px",
                    background: "#F8F9FC",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#6B7280",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Filter size={12} />
                  Filter
                </button>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    background: "#F8F9FC",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MoreHorizontal size={14} style={{ color: "#9CA3AF" }} />
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 0 }}>
              {SR_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSrTab(tab.key)}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: srTab === tab.key ? 600 : 400,
                    color: srTab === tab.key ? "#6C4CFF" : "#9CA3AF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderBottom:
                      srTab === tab.key
                        ? "2px solid #6C4CFF"
                        : "2px solid transparent",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                  {tabCount[tab.key] > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        background: srTab === tab.key ? "#6C4CFF" : "#F3F4F6",
                        color: srTab === tab.key ? "white" : "#9CA3AF",
                        borderRadius: 999,
                        padding: "1px 6px",
                        fontWeight: 600,
                      }}
                    >
                      {tabCount[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                  {[
                    "Employee",
                    "Employer",
                    "Requested Amount",
                    "Available Salary",
                    "Repayment Date",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#9CA3AF",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {srLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              height: 10,
                              background: "#F3F4F6",
                              borderRadius: 4,
                              width: j === 0 ? 100 : 60,
                              animation: "pulse 1.5s infinite",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : displayedRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#9CA3AF",
                      }}
                    >
                      No advances in this category
                    </td>
                  </tr>
                ) : (
                  displayedRequests.map((req) => {
                    const st = srStatusStyle(req.status);
                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: "1px solid #F9FAFB",
                          cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FAFAFC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #8B7CFF, #6C4CFF)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {req.employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#111827",
                                  margin: 0,
                                }}
                              >
                                {req.employee.name}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#9CA3AF",
                                  margin: "2px 0 0",
                                }}
                              >
                                EMP{req.employee.id?.slice(-5) ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "#6B7280",
                          }}
                        >
                          {req.employee.employer.companyName}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          ₹{parseFloat(req.amount).toLocaleString("en-IN")}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "#6B7280",
                          }}
                        >
                          —
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "#6B7280",
                          }}
                        >
                          {new Date(req.requestedAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              background: st.bg,
                              color: st.text,
                              borderRadius: 999,
                              padding: "3px 10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {srStatusLabel(req.status)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => void navigate("/salary-requests")}
                            style={{
                              height: 30,
                              padding: "0 14px",
                              background:
                                req.status === "SUBMITTED"
                                  ? "#6C4CFF"
                                  : "#F3F4F6",
                              color:
                                req.status === "SUBMITTED"
                                  ? "white"
                                  : "#6B7280",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {req.status === "SUBMITTED" ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
            <button
              onClick={() => void navigate("/salary-requests")}
              style={{
                fontSize: 13,
                color: "#6C4CFF",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              View all advances →
            </button>
          </div>
        </div>

        {/* ── Right: Recent Activity + Employer Health ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Recent Activity */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid #F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Recent Activity
              </span>
              <button
                onClick={() => void navigate("/audit-logs")}
                style={{
                  fontSize: 12,
                  color: "#6C4CFF",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                View all
              </button>
            </div>
            <div>
              {recentAuditLogs.length === 0 ? (
                <div
                  style={{
                    padding: "24px 20px",
                    textAlign: "center",
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  No recent activity
                </div>
              ) : (
                recentAuditLogs.map((log, i) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 20px",
                      borderBottom:
                        i < recentAuditLogs.length - 1
                          ? "1px solid #F9FAFB"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#6C4CFF",
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        {log.action}
                        {log.entityType && (
                          <span style={{ color: "#6C4CFF" }}>
                            {" "}
                            · {log.entityType}
                          </span>
                        )}
                      </p>
                      <p
                        style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}
                      >
                        {log.user?.email ?? "System"} · {timeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Employer Health */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid #F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Employer Health
              </span>
              <button
                onClick={() => void navigate("/employers")}
                style={{
                  fontSize: 12,
                  color: "#6C4CFF",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                View all
              </button>
            </div>
            <div>
              {empLoading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: "1px solid #F9FAFB",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#F3F4F6",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 10,
                          background: "#F3F4F6",
                          borderRadius: 4,
                          width: 100,
                          marginBottom: 6,
                        }}
                      />
                      <div
                        style={{
                          height: 8,
                          background: "#F3F4F6",
                          borderRadius: 4,
                          width: 60,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : topEmployers.length === 0 ? (
                <div
                  style={{
                    padding: "24px 20px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#9CA3AF",
                  }}
                >
                  No employers yet
                </div>
              ) : (
                topEmployers.map((emp, i) => {
                  const initial = emp.companyName.charAt(0).toUpperCase();
                  const isHealthy = emp.status === "ACTIVE";
                  return (
                    <button
                      key={emp.id}
                      onClick={() => void navigate("/employers")}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 20px",
                        background: "none",
                        border: "none",
                        borderBottom:
                          i < topEmployers.length - 1
                            ? "1px solid #F9FAFB"
                            : "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FAFAFC";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "#F3F0FF",
                          color: "#6C4CFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#111827",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {emp.companyName}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            margin: "2px 0 0",
                          }}
                        >
                          {emp.totalEmployees ?? "—"} Employees
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: isHealthy ? "#DCFCE7" : "#FEF3C7",
                          color: isHealthy ? "#16A34A" : "#D97706",
                          borderRadius: 999,
                          padding: "2px 8px",
                          flexShrink: 0,
                        }}
                      >
                        {isHealthy ? "Healthy" : emp.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need React import for useState
import React from "react";
