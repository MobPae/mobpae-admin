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

const STATUS_CFG: Record<MembershipStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  ACTIVE:    { label: "Active", dot: "bg-[#4E8A18]", text: "text-[#3B6D11]", bg: "bg-[#EBF6E3]" },
  REJECTED:  { label: "Rejected", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  EXPIRED:   { label: "Expired", dot: "bg-[#D45F18]", text: "text-[#9A4910]", bg: "bg-[#FEF1E7]" },
  CANCELLED: { label: "Cancelled", dot: "bg-[#8D90A3]", text: "text-[#62657A]", bg: "bg-[#F0F0F8]" },
};

function StatusPill({ status }: { status: MembershipStatus }) {
  const c = STATUS_CFG[status] ?? { label: status, bg: "bg-[#F0F0F8]", text: "text-[#62657A]", dot: "bg-[#B7B9C7]" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-[500] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F0F8] last:border-0">
      <span className="text-[12px] text-[#62657A]">{label}</span>
      <span className="text-[12px] font-[500] text-[#191A2E]">{value}</span>
    </div>
  );
}

// ── employer summary table ────────────────────────────────────────────────────

function EmployerSummaryTable({ employers }: { employers: EmployerMembershipSummary[] }) {
  if (!employers.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-[12px] text-[#62657A]">No employer data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[#E4E4EF]">
            {["Company", "Total Members", "Active Members", "Revenue"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-[#62657A] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F0F8]">
          {employers.map(e => (
            <tr key={e.employerId} className="hover:bg-[#F7F7FB]/60 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#ECEBFF] flex items-center justify-center flex-shrink-0">
                    <Building2 size={12} className="text-[#7679FF]" />
                  </div>
                  <span className="font-[500] text-[#191A2E]">{e.companyName}</span>
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums text-[#62657A]">{e.totalMembers}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-[500] bg-[#ECEBFF] text-[#5659D9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7679FF]" />
                  {e.activeMembers}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums font-[600] text-[#191A2E]">{formatCurrency(e.membershipRevenue)}</td>
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
    <div className="px-8 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Memberships</h1>
        <p className="text-[13px] text-[#62657A] mt-0.5">Employee membership plans and verification</p>
      </div>

      {/* Summary cards — GET /membership/summary */}
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
        <div className="bg-[#7679FF] border border-[#5659D9] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-white/70" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-white leading-none tabular-nums">{summary?.totalMembers ?? "—"}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Total members</p>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#ECEBFF] flex items-center justify-center flex-shrink-0">
            <CreditCard size={14} className="text-[#7679FF]" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{summary?.active ?? "—"}</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Active</p>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <CreditCard size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{summary?.pending ?? "—"}</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Pending review</p>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle size={14} className="text-red-500" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{summary?.rejected ?? "—"}</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Rejected</p>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] flex items-center justify-center flex-shrink-0">
            <TimerOff size={14} className="text-[#62657A]" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{summary?.expired ?? "—"}</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Expired</p>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#ECEBFF] flex items-center justify-center flex-shrink-0">
            <CircleDollarSign size={14} className="text-[#7679FF]" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-[#191A2E] leading-none tabular-nums">{formatCurrency(summary?.membershipRevenue ?? 0)}</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Revenue</p>
          </div>
        </div>
      </div>

      {/* Employer breakdown — GET /membership/employer-summary */}
      {employerSummary.length > 0 && (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E4EF]">
            <p className="text-[13px] font-[600] text-[#191A2E]">By Employer</p>
            <p className="text-[11px] text-[#62657A] mt-0.5">Membership breakdown per company</p>
          </div>
          <EmployerSummaryTable employers={employerSummary} />
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search employee, employer, plan…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-[#E4E4EF] rounded-lg outline-none focus:border-[#7679FF] w-64 text-[#62657A] placeholder-[#B7B9C7]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 rounded-full text-[12px] font-[500] transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-[#191A2E] text-white"
                  : "bg-white border border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF]"
              }`}
            >
              {f.label}
              {counts[f.value] !== undefined && (
                <span className={`text-[11px] font-[700] ${filter === f.value ? "text-white/60" : "text-[#62657A]"}`}>
                  {counts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Membership list — GET /membership */}
      <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center"><p className="text-[13px] text-[#62657A]">Loading memberships…</p></div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center mb-3 mx-auto">
              <CreditCard size={18} className="text-[#62657A]" />
            </div>
            <p className="text-[13px] font-[500] text-[#62657A]">No memberships found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E4E4EF]">
                  {["Employee", "Employer", "Plan Name", "Amount", "Status", "Start Date", "End Date", "Created", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-[#62657A] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F8]">
                {rows.map(ms => (
                  <tr
                    key={ms.id}
                    onClick={() => { setSelected(ms); setRemarks(""); setActionError(""); }}
                    className={`cursor-pointer hover:bg-[#F7F7FB]/60 transition-colors ${selected?.id === ms.id ? "bg-[#ECEBFF]/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-[500] text-[#191A2E]">{ms.employee.name}</p>
                      <p className="text-[11px] text-[#62657A]">{ms.employee.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-[#62657A] whitespace-nowrap">{ms.employee.employer.companyName}</td>
                    <td className="px-4 py-3 font-[500] text-[#62657A]">{ms.planName}</td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-[#191A2E] whitespace-nowrap">{formatCurrency(ms.amount)}</td>
                    <td className="px-4 py-3"><StatusPill status={ms.status} /></td>
                    <td className="px-4 py-3 tabular-nums text-[#62657A] whitespace-nowrap">{formatDate(ms.startDate)}</td>
                    <td className="px-4 py-3 tabular-nums text-[#62657A] whitespace-nowrap">{formatDate(ms.endDate)}</td>
                    <td className="px-4 py-3 tabular-nums text-[#62657A] whitespace-nowrap">{formatDate(ms.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5 text-[12px] font-[500] text-[#7679FF] whitespace-nowrap">
                        View <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-[460px] bg-white border-l border-[#E4E4EF] shadow-xl flex flex-col">
            <div className="px-5 pt-5 pb-4 border-b border-[#E4E4EF]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusPill status={selected.status} />
                    {selected.couponCode && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-[500] text-[#5659D9] bg-[#ECEBFF] px-2 py-0.5 rounded-full">
                        <Tag size={9} /> {selected.couponCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-[700] text-[#191A2E]">{selected.employee.name}</p>
                  <p className="text-[12px] text-[#62657A] mt-0.5">{selected.employee.employeeCode} · {selected.employee.employer.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E4E4EF] text-[#62657A] hover:text-[#62657A]">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Plan Details</p>
                <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-1">
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
                <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Payment</p>
                <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-1">
                  <InfoRow label="Reference" value={selected.paymentReference ?? "—"} />
                  {selected.paymentScreenshot && (
                    <div className="py-2.5 border-b border-[#F0F0F8]">
                      <span className="text-[12px] text-[#62657A] block mb-1.5">Screenshot</span>
                      <img
                        src={selected.paymentScreenshot}
                        alt="Payment screenshot"
                        className="rounded-lg border border-[#E4E4EF] max-h-44 object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {(selected.verifiedBy || selected.verifiedAt) && (
                <div>
                  <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Verification</p>
                  <div className="bg-white border border-[#E4E4EF] rounded-xl px-4 py-1">
                    <InfoRow label="Verified by" value={selected.verifiedBy ?? "—"} />
                    <InfoRow label="Verified at" value={formatDate(selected.verifiedAt)} />
                  </div>
                </div>
              )}

              {selected.remarks && (
                <div>
                  <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Remarks</p>
                  <div className="bg-[#F7F7FB] border border-[#E4E4EF] rounded-xl px-4 py-3">
                    <p className="text-[12px] text-[#62657A] leading-relaxed">{selected.remarks}</p>
                  </div>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div>
                  <p className="text-[11px] font-[600] text-[#62657A] uppercase tracking-[0.07em] mb-2">Add Remarks (optional)</p>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add a note before approving or rejecting…"
                    rows={3}
                    className="w-full text-[12px] bg-white border border-[#E4E4EF] rounded-xl px-3 py-2.5 text-[#62657A] placeholder-[#B7B9C7] outline-none focus:border-[#7679FF] resize-none"
                  />
                </div>
              )}
            </div>

            {selected.status === "PENDING" && (
              <div className="px-5 py-4 border-t border-[#E4E4EF] space-y-2">
                {actionError && <p className="text-[11px] text-red-600 text-center">{actionError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={acting !== null}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg border border-[#E4E4EF] text-[#62657A] text-[12px] font-[500] hover:bg-[#F7F7FB] disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={13} />
                    {acting === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={acting !== null}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-[#7679FF] hover:bg-[#5659D9] text-white text-[12px] font-[600] disabled:opacity-50 transition-colors"
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Create coupon */}
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E4EF] flex items-center gap-2">
            <Tag size={14} className="text-[#62657A]" />
            <div>
              <p className="text-[13px] font-[600] text-[#191A2E]">Create Coupon</p>
              <p className="text-[11px] text-[#62657A] mt-0.5">Issue a discount coupon for membership upgrades</p>
            </div>
          </div>
          <form onSubmit={handleCreateCoupon} className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-[500] text-[#62657A] mb-1">Coupon code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOBPAE50"
                  className="w-full h-8 px-3 text-[12px] bg-white border border-[#E4E4EF] rounded-lg text-[#191A2E] font-mono placeholder-[#B7B9C7] focus:outline-none focus:border-[#7679FF] focus:ring-2 focus:ring-[#E4E4EF] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-[500] text-[#62657A] mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={couponDiscount}
                  onChange={e => setCouponDiscount(e.target.value)}
                  placeholder="100"
                  className="w-full h-8 px-3 text-[12px] bg-white border border-[#E4E4EF] rounded-lg text-[#191A2E] placeholder-[#B7B9C7] focus:outline-none focus:border-[#7679FF] focus:ring-2 focus:ring-[#E4E4EF] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-[500] text-[#62657A] mb-1">Valid till <span className="text-[#62657A] font-[400]">(optional)</span></label>
              <input
                type="date"
                value={couponExpiry}
                onChange={e => setCouponExpiry(e.target.value)}
                className="w-full h-8 px-3 text-[12px] bg-white border border-[#E4E4EF] rounded-lg text-[#62657A] focus:outline-none focus:border-[#7679FF] focus:ring-2 focus:ring-[#E4E4EF] transition"
              />
            </div>
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="h-8 px-4 flex items-center gap-1.5 rounded-lg bg-[#191A2E] hover:bg-[#2A2C45] text-white text-[12px] font-[500] disabled:opacity-50 transition-colors"
            >
              <Plus size={13} />
              {createCouponMutation.isPending ? "Creating…" : "Create coupon"}
            </button>
          </form>
        </div>

        {/* Coupon list */}
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E4EF] flex items-center justify-between">
            <div>
              <p className="text-[13px] font-[600] text-[#191A2E]">Active Coupons</p>
              <p className="text-[11px] text-[#62657A] mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
            </div>
          </div>
          {couponsLoading ? (
            <div className="py-8 text-center text-[12px] text-[#62657A]">Loading…</div>
          ) : coupons.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-[#62657A]">No coupons yet. Create one above.</div>
          ) : (
            <div className="divide-y divide-[#F0F0F8] max-h-[280px] overflow-y-auto">
              {coupons.map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#F7F7FB] border border-[#E4E4EF] flex items-center justify-center flex-shrink-0">
                      <Tag size={12} className="text-[#62657A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-[600] text-[#191A2E] font-mono">{c.code}</p>
                      <p className="text-[11px] text-[#62657A]">
                        {c.validTill ? `Expires ${formatDate(c.validTill)}` : "No expiry"}
                        {" · "}Used {c.usedCount}x
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[13px] font-[700] text-[#5659D9]">
                      -{formatCurrency(c.discountAmount)}
                    </span>
                    <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-[500] ${
                      c.isActive ? "bg-[#EBF6E3] text-[#3B6D11]" : "bg-[#F0F0F8] text-[#62657A]"
                    }`}>
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
