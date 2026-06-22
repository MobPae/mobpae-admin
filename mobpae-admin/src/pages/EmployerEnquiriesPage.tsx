import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import EmployerEnquiriesTable from "../components/employer-enquiries/EmployerEnquiriesTable";
import EmployerDetailsDrawer from "../components/employer-enquiries/EmployerDetailsDrawer";
import CreateEmployerDrawer from "../components/employers/CreateEmployerDrawer";
import type { CreateEmployerPrefill } from "../components/employers/CreateEmployerDrawer";
import type { EmployerEnquiry, EmployerEnquiryStatus } from "../types/employer-enquiry";
import { getEmployerEnquiries } from "../services/employerEnquiryService";

const STATUS_CHIPS: { label: string; value: "ALL" | EmployerEnquiryStatus }[] = [
  { label: "All",       value: "ALL"       },
  { label: "New",       value: "NEW"       },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Onboarded", value: "ONBOARDED" },
  { label: "Rejected",  value: "REJECTED"  },
];

const CHIP_ON  = "bg-[#191A2E] text-white border-[#191A2E]";
const CHIP_OFF = "bg-white border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF] hover:text-[#62657A]";

export default function EmployerEnquiriesPage() {
  const { data: enquiries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employer-enquiries"],
    queryFn: getEmployerEnquiries,
  });

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmployerEnquiryStatus>("ALL");
  const [selected,     setSelected]     = useState<EmployerEnquiry | null>(null);
  const [createPrefill, setCreatePrefill] = useState<CreateEmployerPrefill | undefined>(undefined);

  // ONBOARDED counts both APPROVED (legacy) and ONBOARDED (current backend value)
  const counts: Record<EmployerEnquiryStatus, number> = {
    NEW:       enquiries.filter((e) => e.status === "NEW").length,
    CONTACTED: enquiries.filter((e) => e.status === "CONTACTED").length,
    APPROVED:  enquiries.filter((e) => e.status === "APPROVED").length,
    ONBOARDED: enquiries.filter((e) => e.status === "ONBOARDED" || e.status === "APPROVED").length,
    REJECTED:  enquiries.filter((e) => e.status === "REJECTED").length,
  };
  const total = enquiries.length;

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.contactPerson.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    // "ONBOARDED" filter matches both ONBOARDED (current) and APPROVED (legacy)
    const matchStatus =
      statusFilter === "ALL" ||
      e.status === statusFilter ||
      (statusFilter === "ONBOARDED" && e.status === "APPROVED");
    return matchSearch && matchStatus;
  });

  // Called from EmployerDetailsDrawer "Create Employer" button
  function handleCreateFromLead(enquiry: EmployerEnquiry) {
    setCreatePrefill({
      companyName:   enquiry.companyName,
      contactPerson: enquiry.contactPerson,
      email:         enquiry.email,
      phone:         enquiry.phone,
      enquiryId:     enquiry.id,
    });
  }

  const pipeline = [
    { label: "New",       status: "NEW"       as const, color: "bg-amber-400",  text: "text-amber-600"  },
    { label: "Contacted", status: "CONTACTED" as const, color: "bg-[#7679FF]",   text: "text-[#7679FF]"   },
    { label: "Onboarded", status: "ONBOARDED" as const, color: "bg-[#7679FF]",  text: "text-[#7679FF]"  },
    { label: "Rejected",  status: "REJECTED"  as const, color: "bg-[#D4D5E0]",  text: "text-[#62657A]"  },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-[15px] font-[500] text-[#191A2E] leading-none">Enquiries</h1>
        <p className="text-[11px] text-[#62657A] mt-1.5">
          Inbound leads from the website
        </p>
      </div>

      {isError && (
        <div className="bg-white border border-red-100 rounded-xl px-6 py-14 text-center">
          <p className="text-[13px] font-[500] text-red-600">Failed to load enquiries</p>
          <p className="text-[12px] text-[#62657A] mt-1">Check your connection and try again.</p>
          <button onClick={() => void refetch()} className="mt-4 h-8 px-4 text-[12px] font-[500] bg-white border border-[#E4E4EF] rounded-lg hover:bg-[#F7F7FB] transition-colors text-[#62657A]">
            Retry
          </button>
        </div>
      )}

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {pipeline.map(({ label, status, color, text }) => {
          const count = counts[status];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              className={`bg-white border rounded-lg p-3.5 text-left transition-colors ${
                statusFilter === status
                  ? "border-[#E4E4EF]"
                  : "border-[#E4E4EF] hover:border-[#E4E4EF]"
              }`}
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A] leading-none">
                {label}
              </p>
              <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${text} ${
                isLoading ? "opacity-20 animate-pulse" : ""
              }`}>
                {count}
              </p>
              <div className="h-[3px] rounded-full bg-[#F0F0F8] mt-2.5">
                <div
                  className={`h-full rounded-full ${color} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search company, contact, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-56 text-[12px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setStatusFilter(chip.value)}
              className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${
                statusFilter === chip.value ? CHIP_ON : CHIP_OFF
              }`}
            >
              {chip.label}
              {chip.value !== "ALL" && (
                <span className="ml-1 opacity-60">
                  · {counts[chip.value as EmployerEnquiryStatus]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-[#62657A]">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#F0F0F8] last:border-0">
              <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-36 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-24 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-[#F0F0F8] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-lg py-14 text-center">
          <p className="text-[13px] font-[500] text-[#62657A]">No enquiries found</p>
          <p className="text-[11px] text-[#62657A] mt-1">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter."
              : "No employer enquiries submitted yet."}
          </p>
        </div>
      ) : (
        <EmployerEnquiriesTable
          enquiries={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(enquiry) => setSelected(selected?.id === enquiry.id ? null : enquiry)}
        />
      )}

      {/* Lead detail drawer */}
      <EmployerDetailsDrawer
        open={selected !== null}
        employer={selected}
        onClose={() => setSelected(null)}
        onCreateEmployer={handleCreateFromLead}
      />

      {/* Create employer drawer — opened from lead, stays on this page */}
      <CreateEmployerDrawer
        open={createPrefill !== undefined}
        prefill={createPrefill}
        onClose={() => setCreatePrefill(undefined)}
      />
    </div>
  );
}
