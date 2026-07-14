import { useState, useMemo } from "react";
import { useSignedUrl } from "../hooks/useSignedUrl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Plus,
  Search,
  Tag,
  TimerOff,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  getMemberships,
  getMembershipSummary,
  getEmployerMembershipSummary,
  getCoupons,
  createCoupon,
  approveMembership,
  rejectMembership,
} from "../services/membershipService";
import type { Membership, MembershipCoupon, MembershipStatus, EmployerMembershipSummary } from "../types/membership";
import { getApiErrorMessage } from "../utils/api-errors";
import { exportToCsv } from "../utils/exportCsv";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatCurrency = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return fmt.format(Number.isFinite(n as number) ? (n as number) : 0);
};

const formatDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
};

// ── status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<MembershipStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  ACTIVE:    { label: "Active",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
  REJECTED:  { label: "Rejected",  color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  EXPIRED:   { label: "Expired",   color: "var(--color-warning-dark)", bg: "var(--color-warning-bg)" },
  CANCELLED: { label: "Cancelled", color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
};

function StatusPill({ status }: { status: MembershipStatus }) {
  const c = STATUS_CFG[status] ?? { label: status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── filter chips ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: "ALL" | MembershipStatus }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Pending",   value: "PENDING"   },
  { label: "Active",    value: "ACTIVE"    },
  { label: "Rejected",  value: "REJECTED"  },
  { label: "Expired",   value: "EXPIRED"   },
  { label: "Cancelled", value: "CANCELLED" },
];

// ── info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-edge-2)" }}>
      <span style={{ fontSize: 12, color: "var(--color-ink-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink)" }}>{value}</span>
    </div>
  );
}

// ── employer summary table ────────────────────────────────────────────────────

function EmployerSummaryTable({ employers }: { employers: EmployerMembershipSummary[] }) {
  if (!employers.length) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-3)" }}>No employer data available</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
            {["Company", "Total Members", "Active Members", "Revenue"].map(h => (
              <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employers.map(e => (
            <tr key={e.employerId} style={{ borderBottom: "1px solid var(--color-canvas)" }}>
              <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--color-brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 size={12} color="var(--color-brand)" />
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{e.companyName}</span>
                </div>
              </td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "var(--color-ink-3)", fontVariantNumeric: "tabular-nums" }}>{e.totalMembers}</td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: "var(--color-brand-soft)", color: "var(--color-info)", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-brand)" }} />
                  {e.activeMembers}
                </span>
              </td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle", fontWeight: 600, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.membershipRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PAGE_SIZE = 15;

// ── page ──────────────────────────────────────────────────────────────────────

export default function MembershipsPage() {
  const qc = useQueryClient();
  const [search,      setSearch]      = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter,      setFilter]      = useState<"ALL" | MembershipStatus>("ALL");
  const [selected,    setSelected]    = useState<Membership | null>(null);
  const [acting,      setActing]      = useState<"approve" | "reject" | null>(null);
  const [remarks,     setRemarks]     = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [page,        setPage]        = useState(1);

  // Signed URL for the selected membership's payment screenshot
  const { url: screenshotUrl } = useSignedUrl(selected?.paymentScreenshot ?? null);

  // Coupon form state
  const [couponCode,     setCouponCode]     = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponExpiry,   setCouponExpiry]   = useState("");
  const [couponError,    setCouponError]    = useState("");

  // GET /membership
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: getMemberships,
  });

  // GET /membership/summary
  const { data: summary } = useQuery({
    queryKey: ["memberships-summary"],
    queryFn: getMembershipSummary,
  });

  // GET /membership/employer-summary
  const { data: employerSummary = [] } = useQuery({
    queryKey: ["memberships-employer-summary"],
    queryFn: getEmployerMembershipSummary,
  });

  // GET /membership/coupons
  const { data: coupons = [], isLoading: couponsLoading } = useQuery<MembershipCoupon[]>({
    queryKey: ["membership-coupons"],
    queryFn: getCoupons,
  });

  const createCouponMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["membership-coupons"] });
      setCouponCode("");
      setCouponDiscount("");
      setCouponExpiry("");
      setCouponError("");
    },
    onError: (err: unknown) => {
      setCouponError(getApiErrorMessage(err, "Failed to create coupon."));
    },
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const discount = parseFloat(couponDiscount);
    if (!couponCode.trim()) { setCouponError("Coupon code is required."); return; }
    if (!discount || discount <= 0) { setCouponError("Discount amount must be greater than 0."); return; }
    createCouponMutation.mutate({
      code: couponCode.trim().toUpperCase(),
      discountAmount: discount,
      validTill: couponExpiry || undefined,
      isActive: true,
    });
  };

  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: memberships.length };
    memberships.forEach(ms => { m[ms.status] = (m[ms.status] ?? 0) + 1; });
    return m;
  }, [memberships]);

  const rows = useMemo(() =>
    memberships.filter(ms => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch = !q ||
        ms.employee.name.toLowerCase().includes(q) ||
        ms.employee.employeeCode.toLowerCase().includes(q) ||
        ms.employee.employer.companyName.toLowerCase().includes(q) ||
        ms.planName.toLowerCase().includes(q) ||
        (ms.couponCode ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "ALL" || ms.status === filter;
      return matchSearch && matchFilter;
    }),
    [memberships, debouncedSearch, filter]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["memberships"] });
    qc.invalidateQueries({ queryKey: ["memberships-summary"] });
    qc.invalidateQueries({ queryKey: ["memberships-employer-summary"] });
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;
    setActing(action);
    setActionError("");
    try {
      if (action === "approve") await approveMembership(selected.id, remarks || undefined);
      else await rejectMembership(selected.id, remarks || undefined);
      toast.success(action === "approve" ? "Membership approved" : "Membership rejected", {
        description: `${selected.employee.name}'s ${selected.planName} membership has been ${action === "approve" ? "approved" : "rejected"}.`,
      });
      invalidate();
      setSelected(null);
      setRemarks("");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Action failed. Please try again.");
      setActionError(msg);
      toast.error("Action failed", { description: msg });
    } finally {
      setActing(null);
      setConfirmAction(null);
    }
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>Memberships</h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>Employee membership plans and verification</p>
        </div>
        <button
          onClick={() => exportToCsv(rows.map(ms => ({
            Employee: ms.employee.name,
            Code: ms.employee.employeeCode,
            Employer: ms.employee.employer.companyName,
            Plan: ms.planName,
            Amount: ms.amount,
            Status: ms.status,
            "Start Date": ms.startDate ?? "",
            "End Date": ms.endDate ?? "",
            Created: ms.createdAt,
          })), "memberships")}
          style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Summary cards — GET /membership/summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24, marginBottom: 24 }}>
        {[
          { icon: <Users size={18} color="white" strokeWidth={1.75} />,            iconBg: "linear-gradient(135deg,var(--color-info),#315eff)", label: "Total Members",  val: summary?.totalMembers ?? "—" },
          { icon: <CreditCard size={18} color="var(--color-success)" strokeWidth={1.75} />,      iconBg: "var(--color-success-bg)",                                  label: "Active",         val: summary?.active ?? "—"       },
          { icon: <CreditCard size={18} color="var(--color-warning)" strokeWidth={1.75} />,      iconBg: "var(--color-warning-bg)",                                  label: "Pending Review", val: summary?.pending ?? "—"      },
          { icon: <XCircle size={18} color="#EF4444" strokeWidth={1.75} />,         iconBg: "var(--color-danger-bg)",                                  label: "Rejected",       val: summary?.rejected ?? "—"     },
          { icon: <TimerOff size={18} color="var(--color-ink-3)" strokeWidth={1.75} />,        iconBg: "var(--color-surface-muted)",                                  label: "Expired",        val: summary?.expired ?? "—"      },
          { icon: <CircleDollarSign size={18} color="var(--color-brand)" strokeWidth={1.75} />, iconBg: "var(--color-brand-soft)",                                 label: "Revenue",        val: formatCurrency(summary?.membershipRevenue ?? 0) },
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

      {/* Employer breakdown — GET /membership/employer-summary */}
      {employerSummary.length > 0 && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-edge)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>By Employer</p>
            <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>Membership breakdown per company</p>
          </div>
          <EmployerSummaryTable employers={employerSummary} />
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 260 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employee, employer, plan…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                style={{ height: 36, padding: "0 14px", background: active ? "var(--color-ink)" : "white", color: active ? "white" : "var(--color-ink-3)", border: `1px solid ${active ? "var(--color-ink)" : "var(--color-edge)"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
              >
                {f.label}
                {counts[f.value] !== undefined && (
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{counts[f.value]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Membership list — GET /membership */}
      <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
        {isLoading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--color-canvas)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 100 }} className="animate-pulse" />
                </div>
                <div style={{ height: 22, background: "var(--color-surface-muted)", borderRadius: 999, width: 80 }} className="animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <CreditCard size={18} color="var(--color-ink-3)" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink-3)", margin: 0 }}>No memberships found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
                  {["Employee", "Employer", "Plan Name", "Amount", "Status", "Start Date", "End Date", "Created", ""].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(ms => (
                  <tr
                    key={ms.id}
                    onClick={() => { setSelected(ms); setRemarks(""); setActionError(""); }}
                    style={{ borderBottom: "1px solid var(--color-canvas)", cursor: "pointer", background: selected?.id === ms.id ? "var(--color-brand-soft)" : "transparent" }}
                  >
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{ms.employee.name}</p>
                      <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{ms.employee.employeeCode}</p>
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--color-ink-3)", whiteSpace: "nowrap" }}>{ms.employee.employer.companyName}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, color: "var(--color-ink-3)" }}>{ms.planName}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, color: "var(--color-ink)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(ms.amount)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}><StatusPill status={ms.status} /></td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--color-ink-4)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.startDate)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--color-ink-4)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.endDate)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "var(--color-ink-4)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.createdAt)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: "var(--color-brand)", whiteSpace: "nowrap" }}>
                        View <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
              <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: 0 }}>{rows.length} membership{rows.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>

      {!isLoading && rows.length > 0 && (
        <Pagination page={safePage} totalPages={totalPages} total={rows.length} limit={PAGE_SIZE} onPage={setPage} />
      )}

      {/* Detail drawer */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(1px)" }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 40, width: 460, background: "white", borderLeft: "1px solid var(--color-edge)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--color-edge)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <StatusPill status={selected.status} />
                    {selected.couponCode && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "var(--color-info)", background: "var(--color-brand-soft)", padding: "2px 8px", borderRadius: 999 }}>
                        <Tag size={9} /> {selected.couponCode}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-ink)", margin: 0 }}>{selected.employee.name}</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 2 }}>{selected.employee.employeeCode} · {selected.employee.employer.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--color-edge)", background: "white", color: "var(--color-ink-3)", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Plan Details</p>
                <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Plan name"        value={selected.planName} />
                  <InfoRow label="Amount"           value={formatCurrency(selected.amount)} />
                  {selected.discountAmount && parseFloat(selected.discountAmount) > 0 && (
                    <InfoRow label="Discount applied" value={formatCurrency(selected.discountAmount)} />
                  )}
                  <InfoRow label="Start date"       value={formatDate(selected.startDate)} />
                  <InfoRow label="End date"         value={formatDate(selected.endDate)} />
                  <InfoRow label="Created"          value={formatDate(selected.createdAt)} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Payment</p>
                <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Reference" value={selected.paymentReference ?? "—"} />
                  {selected.paymentScreenshot && screenshotUrl && (
                    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--color-edge-2)" }}>
                      <span style={{ fontSize: 12, color: "var(--color-ink-3)", display: "block", marginBottom: 6 }}>Screenshot</span>
                      <a href={screenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={screenshotUrl}
                          alt="Payment screenshot"
                          style={{ borderRadius: 10, border: "1px solid var(--color-edge)", maxHeight: 176, objectFit: "contain" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {(selected.verifiedBy || selected.verifiedAt) && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Verification</p>
                  <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "0 16px" }}>
                    <InfoRow label="Verified by" value={selected.verifiedBy ?? "—"} />
                    <InfoRow label="Verified at" value={formatDate(selected.verifiedAt)} />
                  </div>
                </div>
              )}

              {selected.remarks && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Remarks</p>
                  <div style={{ background: "var(--color-canvas)", border: "1px solid var(--color-edge)", borderRadius: 16, padding: "12px 16px" }}>
                    <p style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.6, margin: 0 }}>{selected.remarks}</p>
                  </div>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Add Remarks (optional)</p>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add a note before approving or rejecting…"
                    rows={3}
                    style={{ width: "100%", fontSize: 12, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, padding: "10px 12px", color: "var(--color-ink-3)", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>

            {selected.status === "PENDING" && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-edge)", display: "flex", flexDirection: "column", gap: 8 }}>
                {actionError && <p style={{ fontSize: 11, color: "var(--color-danger)", textAlign: "center", margin: 0 }}>{actionError}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setConfirmAction("reject")}
                    disabled={acting !== null}
                    style={{ flex: 1, height: 38, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, border: "1px solid var(--color-edge)", color: "var(--color-ink-3)", fontSize: 12, fontWeight: 500, background: "white", cursor: acting !== null ? "not-allowed" : "pointer", opacity: acting !== null ? 0.5 : 1, fontFamily: "inherit" }}
                  >
                    <XCircle size={13} />
                    {acting === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                  <button
                    onClick={() => setConfirmAction("approve")}
                    disabled={acting !== null}
                    style={{ flex: 1, height: 38, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, background: "var(--color-brand)", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: acting !== null ? "not-allowed" : "pointer", opacity: acting !== null ? 0.5 : 1, fontFamily: "inherit" }}
                  >
                    <CheckCircle2 size={13} />
                    {acting === "approve" ? "Approving…" : "Approve"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Coupon Management ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Create coupon */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-edge)", display: "flex", alignItems: "center", gap: 10 }}>
            <Tag size={14} color="var(--color-ink-3)" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Create Coupon</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>Issue a discount coupon for membership upgrades</p>
            </div>
          </div>
          <form onSubmit={handleCreateCoupon} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--color-ink-3)", marginBottom: 4 }}>Coupon code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOBPAE50"
                  style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, color: "var(--color-ink)", fontFamily: "ui-monospace, monospace", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--color-ink-3)", marginBottom: 4 }}>Discount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={couponDiscount}
                  onChange={e => setCouponDiscount(e.target.value)}
                  placeholder="100"
                  style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, color: "var(--color-ink)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--color-ink-3)", marginBottom: 4 }}>Valid till <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input
                type="date"
                value={couponExpiry}
                onChange={e => setCouponExpiry(e.target.value)}
                style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid var(--color-edge)", borderRadius: 10, color: "var(--color-ink-3)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
            {couponError && <p style={{ fontSize: 11, color: "var(--color-danger)", margin: 0 }}>{couponError}</p>}
            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              style={{ height: 36, padding: "0 16px", display: "flex", alignItems: "center", gap: 6, borderRadius: 10, background: "var(--color-ink)", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", opacity: createCouponMutation.isPending ? 0.5 : 1, width: "fit-content" }}
            >
              <Plus size={13} />
              {createCouponMutation.isPending ? "Creating…" : "Create coupon"}
            </button>
          </form>
        </div>

        {/* Coupon list */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-edge)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Active Coupons</p>
            <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
          </div>
          {couponsLoading ? (
            <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 12, color: "var(--color-ink-3)" }}>Loading…</div>
          ) : coupons.length === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 12, color: "var(--color-ink-3)" }}>No coupons yet. Create one above.</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {coupons.map(c => (
                <div key={c.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-edge-2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--color-canvas)", border: "1px solid var(--color-edge)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Tag size={12} color="var(--color-ink-3)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)", margin: 0, fontFamily: "ui-monospace, monospace" }}>{c.code}</p>
                      <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2 }}>
                        {c.validTill ? `Expires ${formatDate(c.validTill)}` : "No expiry"} · Used {c.usedCount}x
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-info)" }}>-{formatCurrency(c.discountAmount)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.isActive ? "var(--color-success-bg)" : "var(--color-surface-muted)", color: c.isActive ? "var(--color-success)" : "var(--color-ink-3)" }}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmAction !== null}
        title={confirmAction === "approve" ? "Approve this membership?" : "Reject this membership?"}
        description={selected ? `${selected.employee.name}'s ${selected.planName} membership will be ${confirmAction === "approve" ? "activated" : "rejected"}.` : ""}
        confirmLabel={confirmAction === "approve" ? "Approve" : "Reject"}
        confirmVariant={confirmAction === "approve" ? "primary" : "danger"}
        loading={acting !== null}
        onConfirm={() => confirmAction && void handleAction(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
