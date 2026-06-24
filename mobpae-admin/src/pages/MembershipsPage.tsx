import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
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
  PENDING:   { label: "Pending",   color: "#D97706", bg: "#FEF3C7" },
  ACTIVE:    { label: "Active",    color: "#16A34A", bg: "#DCFCE7" },
  REJECTED:  { label: "Rejected",  color: "#DC2626", bg: "#FEE2E2" },
  EXPIRED:   { label: "Expired",   color: "#B45309", bg: "#FEF3C7" },
  CANCELLED: { label: "Cancelled", color: "#6B7280", bg: "#F3F4F6" },
};

function StatusPill({ status }: { status: MembershipStatus }) {
  const c = STATUS_CFG[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6" };
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
      <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>{value}</span>
    </div>
  );
}

// ── employer summary table ────────────────────────────────────────────────────

function EmployerSummaryTable({ employers }: { employers: EmployerMembershipSummary[] }) {
  if (!employers.length) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#6B7280" }}>No employer data available</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            {["Company", "Total Members", "Active Members", "Revenue"].map(h => (
              <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employers.map(e => (
            <tr key={e.employerId} style={{ borderBottom: "1px solid #F9FAFB" }}>
              <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 size={12} color="#6C4CFF" />
                  </div>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{e.companyName}</span>
                </div>
              </td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>{e.totalMembers}</td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: "#F3F0FF", color: "#5B34FF", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C4CFF" }} />
                  {e.activeMembers}
                </span>
              </td>
              <td style={{ padding: "14px 20px", verticalAlign: "middle", fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(e.membershipRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function MembershipsPage() {
  const qc = useQueryClient();
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<"ALL" | MembershipStatus>("ALL");
  const [selected,    setSelected]    = useState<Membership | null>(null);
  const [acting,      setActing]      = useState<"approve" | "reject" | null>(null);
  const [remarks,     setRemarks]     = useState("");
  const [actionError, setActionError] = useState("");

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
      const q = search.toLowerCase();
      const matchSearch = !q ||
        ms.employee.name.toLowerCase().includes(q) ||
        ms.employee.employeeCode.toLowerCase().includes(q) ||
        ms.employee.employer.companyName.toLowerCase().includes(q) ||
        ms.planName.toLowerCase().includes(q) ||
        (ms.couponCode ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "ALL" || ms.status === filter;
      return matchSearch && matchFilter;
    }),
    [memberships, search, filter]
  );

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
      invalidate();
      setSelected(null);
      setRemarks("");
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setActing(null);
    }
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Memberships</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Employee membership plans and verification</p>
      </div>

      {/* Summary cards — GET /membership/summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24, marginBottom: 24 }}>
        {[
          { icon: <Users size={18} color="white" strokeWidth={1.75} />,            iconBg: "linear-gradient(135deg,#5B34FF,#6C4CFF)", label: "Total Members",  val: summary?.totalMembers ?? "—" },
          { icon: <CreditCard size={18} color="#16A34A" strokeWidth={1.75} />,      iconBg: "#DCFCE7",                                  label: "Active",         val: summary?.active ?? "—"       },
          { icon: <CreditCard size={18} color="#D97706" strokeWidth={1.75} />,      iconBg: "#FEF3C7",                                  label: "Pending Review", val: summary?.pending ?? "—"      },
          { icon: <XCircle size={18} color="#EF4444" strokeWidth={1.75} />,         iconBg: "#FEE2E2",                                  label: "Rejected",       val: summary?.rejected ?? "—"     },
          { icon: <TimerOff size={18} color="#6B7280" strokeWidth={1.75} />,        iconBg: "#F3F4F6",                                  label: "Expired",        val: summary?.expired ?? "—"      },
          { icon: <CircleDollarSign size={18} color="#6C4CFF" strokeWidth={1.75} />, iconBg: "#F3F0FF",                                 label: "Revenue",        val: formatCurrency(summary?.membershipRevenue ?? 0) },
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

      {/* Employer breakdown — GET /membership/employer-summary */}
      {employerSummary.length > 0 && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>By Employer</p>
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Membership breakdown per company</p>
          </div>
          <EmployerSummaryTable employers={employerSummary} />
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 12, minWidth: 260 }}>
          <Search size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employee, employer, plan…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13.5, color: "#111827", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{ height: 36, padding: "0 14px", background: active ? "#111827" : "white", color: active ? "white" : "#6B7280", border: `1px solid ${active ? "#111827" : "#E5E7EB"}`, borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
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
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {isLoading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #F9FAFB" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: "#F3F4F6", borderRadius: 4, width: 140, marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ height: 10, background: "#F3F4F6", borderRadius: 4, width: 100 }} className="animate-pulse" />
                </div>
                <div style={{ height: 22, background: "#F3F4F6", borderRadius: 999, width: 80 }} className="animate-pulse" />
              </div>
            ))}
          </div>
        ) : !rows.length ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <CreditCard size={18} color="#6B7280" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0 }}>No memberships found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                  {["Employee", "Employer", "Plan Name", "Amount", "Status", "Start Date", "End Date", "Created", ""].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(ms => (
                  <tr
                    key={ms.id}
                    onClick={() => { setSelected(ms); setRemarks(""); setActionError(""); }}
                    style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: selected?.id === ms.id ? "#F3F0FF" : "transparent" }}
                  >
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", margin: 0 }}>{ms.employee.name}</p>
                      <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{ms.employee.employeeCode}</p>
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "#6B7280", whiteSpace: "nowrap" }}>{ms.employee.employer.companyName}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 500, color: "#6B7280" }}>{ms.planName}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(ms.amount)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}><StatusPill status={ms.status} /></td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "#9CA3AF", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.startDate)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "#9CA3AF", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.endDate)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle", color: "#9CA3AF", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{formatDate(ms.createdAt)}</td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: "#6C4CFF", whiteSpace: "nowrap" }}>
                        View <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{rows.length} membership{rows.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(1px)" }} onClick={() => setSelected(null)} />
          <div style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 40, width: 460, background: "white", borderLeft: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <StatusPill status={selected.status} />
                    {selected.couponCode && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#5B34FF", background: "#F3F0FF", padding: "2px 8px", borderRadius: 999 }}>
                        <Tag size={9} /> {selected.couponCode}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{selected.employee.name}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{selected.employee.employeeCode} · {selected.employee.employer.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#6B7280", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Plan Details</p>
                <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "0 16px" }}>
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
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Payment</p>
                <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "0 16px" }}>
                  <InfoRow label="Reference" value={selected.paymentReference ?? "—"} />
                  {selected.paymentScreenshot && (
                    <div style={{ padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 6 }}>Screenshot</span>
                      <img
                        src={selected.paymentScreenshot}
                        alt="Payment screenshot"
                        style={{ borderRadius: 10, border: "1px solid #E5E7EB", maxHeight: 176, objectFit: "contain" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {(selected.verifiedBy || selected.verifiedAt) && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Verification</p>
                  <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "0 16px" }}>
                    <InfoRow label="Verified by" value={selected.verifiedBy ?? "—"} />
                    <InfoRow label="Verified at" value={formatDate(selected.verifiedAt)} />
                  </div>
                </div>
              )}

              {selected.remarks && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Remarks</p>
                  <div style={{ background: "#F8F9FC", border: "1px solid #E5E7EB", borderRadius: 16, padding: "12px 16px" }}>
                    <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{selected.remarks}</p>
                  </div>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Add Remarks (optional)</p>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add a note before approving or rejecting…"
                    rows={3}
                    style={{ width: "100%", fontSize: 12, background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 12px", color: "#6B7280", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>

            {selected.status === "PENDING" && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 8 }}>
                {actionError && <p style={{ fontSize: 11, color: "#DC2626", textAlign: "center", margin: 0 }}>{actionError}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={acting !== null}
                    style={{ flex: 1, height: 38, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, border: "1px solid #E5E7EB", color: "#6B7280", fontSize: 12, fontWeight: 500, background: "white", cursor: acting !== null ? "not-allowed" : "pointer", opacity: acting !== null ? 0.5 : 1, fontFamily: "inherit" }}
                  >
                    <XCircle size={13} />
                    {acting === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={acting !== null}
                    style={{ flex: 1, height: 38, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, background: "#6C4CFF", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: acting !== null ? "not-allowed" : "pointer", opacity: acting !== null ? 0.5 : 1, fontFamily: "inherit" }}
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
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 10 }}>
            <Tag size={14} color="#6B7280" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>Create Coupon</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Issue a discount coupon for membership upgrades</p>
            </div>
          </div>
          <form onSubmit={handleCreateCoupon} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Coupon code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOBPAE50"
                  style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, color: "#111827", fontFamily: "ui-monospace, monospace", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Discount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={couponDiscount}
                  onChange={e => setCouponDiscount(e.target.value)}
                  placeholder="100"
                  style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Valid till <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input
                type="date"
                value={couponExpiry}
                onChange={e => setCouponExpiry(e.target.value)}
                style={{ width: "100%", height: 36, padding: "0 12px", fontSize: 12, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, color: "#6B7280", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
            {couponError && <p style={{ fontSize: 11, color: "#DC2626", margin: 0 }}>{couponError}</p>}
            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              style={{ height: 36, padding: "0 16px", display: "flex", alignItems: "center", gap: 6, borderRadius: 10, background: "#111827", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", opacity: createCouponMutation.isPending ? 0.5 : 1, width: "fit-content" }}
            >
              <Plus size={13} />
              {createCouponMutation.isPending ? "Creating…" : "Create coupon"}
            </button>
          </form>
        </div>

        {/* Coupon list */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>Active Coupons</p>
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
          </div>
          {couponsLoading ? (
            <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 12, color: "#6B7280" }}>Loading…</div>
          ) : coupons.length === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 12, color: "#6B7280" }}>No coupons yet. Create one above.</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {coupons.map(c => (
                <div key={c.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#F8F9FC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Tag size={12} color="#6B7280" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0, fontFamily: "ui-monospace, monospace" }}>{c.code}</p>
                      <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        {c.validTill ? `Expires ${formatDate(c.validTill)}` : "No expiry"} · Used {c.usedCount}x
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#5B34FF" }}>-{formatCurrency(c.discountAmount)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.isActive ? "#DCFCE7" : "#F3F4F6", color: c.isActive ? "#16A34A" : "#6B7280" }}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
