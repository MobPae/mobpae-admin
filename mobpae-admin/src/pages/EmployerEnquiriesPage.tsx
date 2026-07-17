import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, Phone, CheckCircle, XCircle, Plus, Download } from "lucide-react";
import EmployerEnquiriesTable from "../components/employer-enquiries/EmployerEnquiriesTable";
import EmployerDetailsDrawer from "../components/employer-enquiries/EmployerDetailsDrawer";
import CreateEmployerDrawer from "../components/employers/CreateEmployerDrawer";
import type { CreateEmployerPrefill } from "../components/employers/CreateEmployerDrawer";
import type { EmployerEnquiry, EmployerEnquiryStatus } from "../types/employer-enquiry";
import { getEmployerEnquiries } from "../services/employerEnquiryService";
import { exportToCsv } from "../utils/exportCsv";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Pagination } from "../components/ui/Pagination";

const P = "var(--color-brand)";
const PAGE_SIZE = 15;

const STATUS_TABS: { label: string; value: "ALL" | EmployerEnquiryStatus }[] = [
  { label: "All",       value: "ALL"       },
  { label: "New",       value: "NEW"       },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Onboarded", value: "ONBOARDED" },
  { label: "Rejected",  value: "REJECTED"  },
];

export default function EmployerEnquiriesPage() {
  const { data: enquiries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employer-enquiries"],
    queryFn: getEmployerEnquiries,
  });

  const [search,        setSearch]        = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [statusFilter,  setStatusFilter]  = useState<"ALL" | EmployerEnquiryStatus>("ALL");
  const [page,          setPage]          = useState(1);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const selected = useMemo(
    () => (selectedId ? enquiries.find((e) => e.id === selectedId) ?? null : null),
    [enquiries, selectedId]
  );
  const [createPrefill, setCreatePrefill] = useState<CreateEmployerPrefill | undefined>(undefined);

  const counts: Record<EmployerEnquiryStatus, number> = {
    NEW:       enquiries.filter((e) => e.status === "NEW").length,
    CONTACTED: enquiries.filter((e) => e.status === "CONTACTED").length,
    APPROVED:  enquiries.filter((e) => e.status === "APPROVED").length,
    ONBOARDED: enquiries.filter((e) => e.status === "ONBOARDED" || e.status === "APPROVED").length,
    REJECTED:  enquiries.filter((e) => e.status === "REJECTED").length,
  };

  const filtered = enquiries.filter((e) => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.contactPerson.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "ALL" ||
      e.status === statusFilter ||
      (statusFilter === "ONBOARDED" && e.status === "APPROVED");
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleCreateFromLead(enquiry: EmployerEnquiry) {
    setSelectedId(null);
    setCreatePrefill({
      companyName:   enquiry.companyName,
      contactPerson: enquiry.contactPerson,
      email:         enquiry.email,
      phone:         enquiry.phone,
      enquiryId:     enquiry.id,
    });
  }

  const kpis = [
    { icon: <Building2 size={18} color="var(--color-warning)" strokeWidth={1.75} />, iconBg: "var(--color-warning-bg)", label: "New Leads",  val: counts["NEW"]       },
    { icon: <Phone size={18} color={P} strokeWidth={1.75} />,           iconBg: "var(--color-brand-soft)", label: "Contacted", val: counts["CONTACTED"]  },
    { icon: <CheckCircle size={18} color="var(--color-success)" strokeWidth={1.75}/>, iconBg: "var(--color-success-bg)", label: "Onboarded", val: counts["ONBOARDED"]  },
    { icon: <XCircle size={18} color="#EF4444" strokeWidth={1.75} />,   iconBg: "var(--color-danger-bg)", label: "Rejected",  val: counts["REJECTED"]   },
  ];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%" }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>
            Enquiries
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>
            Inbound leads from the website
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => exportToCsv(filtered.map(e => ({
              Company: e.companyName,
              Contact: e.contactPerson,
              Email: e.email,
              Phone: e.phone,
              Status: e.status,
              Created: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "",
            })), "employer-enquiries")}
            style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setCreatePrefill({})}
            style={{
              height: 40, padding: "0 18px",
              display: "flex", alignItems: "center", gap: 8,
              background: P, border: "none", borderRadius: 12,
              fontSize: 13.5, fontWeight: 600, color: "white",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Plus size={15} />
            Add Employer
          </button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────── */}
      {isError && (
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid var(--color-danger-bg)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Failed to load enquiries.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid var(--color-danger-bg)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>
            Retry
          </button>
        </div>
      )}

      {/* ── KPI cards ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map(({ icon, iconBg, label, val }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid var(--color-edge)", boxShadow: "0 1px 4px rgba(17,24,39,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1, opacity: isLoading ? 0.3 : 1 }}>
                {val}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-3)", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", background: "white", border: "1px solid var(--color-edge)", borderRadius: 12, minWidth: 260 }}>
          <Search size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search company, contact, email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, fontSize: 13.5, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            const cnt = tab.value !== "ALL" ? counts[tab.value as EmployerEnquiryStatus] : enquiries.length;
            return (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
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
                <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--color-ink-4)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {isLoading ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--color-canvas)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-surface-muted)", flexShrink: 0 }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 160, marginBottom: 8 }} className="animate-pulse" />
                <div style={{ height: 10, background: "var(--color-surface-muted)", borderRadius: 4, width: 120 }} className="animate-pulse" />
              </div>
              <div style={{ height: 24, background: "var(--color-surface-muted)", borderRadius: 999, width: 80 }} className="animate-pulse" />
              <div style={{ height: 12, background: "var(--color-surface-muted)", borderRadius: 4, width: 60 }} className="animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", padding: "64px 24px", textAlign: "center" }}>
          <Building2 size={36} style={{ color: "var(--color-edge)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>No enquiries found</p>
          <p style={{ fontSize: 13, color: "var(--color-ink-4)", marginTop: 6 }}>
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter."
              : "No employer enquiries submitted yet."}
          </p>
        </div>
      ) : (
        <>
          <EmployerEnquiriesTable
            enquiries={paginated}
            selectedId={selectedId}
            onSelect={(enquiry) => setSelectedId(selectedId === enquiry.id ? null : enquiry.id)}
          />
          <Pagination page={safePage} totalPages={totalPages} total={filtered.length} limit={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      {/* ── Drawers ────────────────────────────────── */}
      <EmployerDetailsDrawer
        open={selected !== null}
        employer={selected}
        onClose={() => setSelectedId(null)}
        onCreateEmployer={handleCreateFromLead}
      />

      <CreateEmployerDrawer
        open={createPrefill !== undefined}
        prefill={createPrefill}
        onClose={() => setCreatePrefill(undefined)}
      />
    </div>
  );
}
