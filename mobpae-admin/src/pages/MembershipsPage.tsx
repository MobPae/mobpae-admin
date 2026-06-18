import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
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
  approveMembership,
  rejectMembership,
} from "../services/membershipService";
import type { Membership, MembershipStatus, EmployerMembershipSummary } from "../types/membership";
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
  PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
  ACTIVE:    { label: "Active",    bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400"     },
  EXPIRED:   { label: "Expired",   bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
};

function StatusPill({ status }: { status: MembershipStatus }) {
  const c = STATUS_CFG[status] ?? { label: status, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
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
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className="text-[12px] font-[500] text-slate-800">{value}</span>
    </div>
  );
}

// ── employer summary table ────────────────────────────────────────────────────

function EmployerSummaryTable({ employers }: { employers: EmployerMembershipSummary[] }) {
  if (!employers.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-[12px] text-slate-400">No employer data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-slate-100">
            {["Company", "Total Members", "Active Members", "Revenue"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employers.map(e => (
            <tr key={e.employerId} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#fdf3ee] flex items-center justify-center flex-shrink-0">
                    <Building2 size={12} className="text-[#c4522a]" />
                  </div>
                  <span className="font-[500] text-slate-800">{e.companyName}</span>
                </div>
              </td>
              <td className="px-4 py-3 tabular-nums text-slate-600">{e.totalMembers}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-[500] bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {e.activeMembers}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums font-[600] text-slate-800">{formatCurrency(e.membershipRevenue)}</td>
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
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Memberships</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Employee membership plans and verification</p>
      </div>

      {/* Summary cards — GET /membership/summary */}
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
        <div className="bg-[#c4522a] border border-[#a8411f] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-white/70" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-white leading-none tabular-nums">{summary?.totalMembers ?? "—"}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Total members</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CreditCard size={14} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{summary?.active ?? "—"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <CreditCard size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{summary?.pending ?? "—"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pending review</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle size={14} className="text-red-500" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{summary?.rejected ?? "—"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Rejected</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <TimerOff size={14} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{summary?.expired ?? "—"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Expired</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CircleDollarSign size={14} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{formatCurrency(summary?.membershipRevenue ?? 0)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Revenue</p>
          </div>
        </div>
      </div>

      {/* Employer breakdown — GET /membership/employer-summary */}
      {employerSummary.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-[13px] font-[600] text-slate-900">By Employer</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Membership breakdown per company</p>
          </div>
          <EmployerSummaryTable employers={employerSummary} />
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, employer, plan…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-64 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 rounded-full text-[12px] font-[500] transition-colors flex items-center gap-1.5 ${
                filter === f.value
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
              {counts[f.value] !== undefined && (
                <span className={`text-[10px] font-[700] ${filter === f.value ? "text-white/60" : "text-slate-400"}`}>
                  {counts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Membership list — GET /membership */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center"><p className="text-[13px] text-slate-400">Loading memberships…</p></div>
        ) : !rows.length ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 mx-auto">
              <CreditCard size={18} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-[500] text-slate-500">No memberships found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Employee", "Employer", "Plan Name", "Amount", "Status", "Start Date", "End Date", "Created", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-[500] text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(ms => (
                  <tr
                    key={ms.id}
                    onClick={() => { setSelected(ms); setRemarks(""); setActionError(""); }}
                    className={`cursor-pointer hover:bg-slate-50/60 transition-colors ${selected?.id === ms.id ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-[500] text-slate-800">{ms.employee.name}</p>
                      <p className="text-[10px] text-slate-400">{ms.employee.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ms.employee.employer.companyName}</td>
                    <td className="px-4 py-3 font-[500] text-slate-700">{ms.planName}</td>
                    <td className="px-4 py-3 tabular-nums font-[600] text-slate-800 whitespace-nowrap">{formatCurrency(ms.amount)}</td>
                    <td className="px-4 py-3"><StatusPill status={ms.status} /></td>
                    <td className="px-4 py-3 tabular-nums text-slate-500 whitespace-nowrap">{formatDate(ms.startDate)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-500 whitespace-nowrap">{formatDate(ms.endDate)}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-500 whitespace-nowrap">{formatDate(ms.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5 text-[12px] font-[500] text-blue-500 whitespace-nowrap">
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
          <div className="fixed inset-y-0 right-0 z-40 w-[460px] bg-white border-l border-slate-200 shadow-xl flex flex-col">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusPill status={selected.status} />
                    {selected.couponCode && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-[500] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Tag size={9} /> {selected.couponCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-[700] text-slate-900">{selected.employee.name}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{selected.employee.employeeCode} · {selected.employee.employer.companyName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Plan Details</p>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
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
                <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Payment</p>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
                  <InfoRow label="Reference" value={selected.paymentReference ?? "—"} />
                  {selected.paymentScreenshot && (
                    <div className="py-2.5 border-b border-slate-50">
                      <span className="text-[12px] text-slate-500 block mb-1.5">Screenshot</span>
                      <img
                        src={selected.paymentScreenshot}
                        alt="Payment screenshot"
                        className="rounded-lg border border-slate-200 max-h-44 object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {(selected.verifiedBy || selected.verifiedAt) && (
                <div>
                  <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Verification</p>
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
                    <InfoRow label="Verified by" value={selected.verifiedBy ?? "—"} />
                    <InfoRow label="Verified at" value={formatDate(selected.verifiedAt)} />
                  </div>
                </div>
              )}

              {selected.remarks && (
                <div>
                  <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Remarks</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <p className="text-[12px] text-slate-600 leading-relaxed">{selected.remarks}</p>
                  </div>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div>
                  <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-[0.07em] mb-2">Add Remarks (optional)</p>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add a note before approving or rejecting…"
                    rows={3}
                    className="w-full text-[12px] bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              )}
            </div>

            {selected.status === "PENDING" && (
              <div className="px-5 py-4 border-t border-slate-100 space-y-2">
                {actionError && <p className="text-[11px] text-red-600 text-center">{actionError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={acting !== null}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-[500] hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={13} />
                    {acting === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={acting !== null}
                    className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-[600] disabled:opacity-50 transition-colors"
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
    </div>
  );
}
