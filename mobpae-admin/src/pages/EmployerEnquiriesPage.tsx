import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Building2, CheckCircle2, XCircle, Clock } from "lucide-react";

import EmployerEnquiriesTable from "../components/employer-enquiries/EmployerEnquiriesTable";
import EmployerDetailsDrawer from "../components/employer-enquiries/EmployerDetailsDrawer";
import type { EmployerEnquiry, EmployerEnquiryStatus } from "../types/employer-enquiry";
import { getEmployerEnquiries } from "../services/employerEnquiryService";

const STATUS_FILTERS: { label: string; value: "ALL" | EmployerEnquiryStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function EmployerEnquiriesPage() {
  const queryClient = useQueryClient();

  const { data: enquiries = [], isLoading, isError } = useQuery({
    queryKey: ["employer-enquiries"],
    queryFn: getEmployerEnquiries,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EmployerEnquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmployerEnquiryStatus>("ALL");

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      e.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = enquiries.filter((e) => e.status === "NEW").length;
  const approvedCount = enquiries.filter((e) => e.status === "APPROVED").length;
  const rejectedCount = enquiries.filter((e) => e.status === "REJECTED").length;

  const handleInvalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["employer-enquiries"] });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-[700] tracking-tight text-slate-900">
            Employer Enquiries
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Review and approve employer onboarding requests
          </p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          Could not load enquiries. Check that the backend is running.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "—" : newCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Review</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "—" : approvedCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Approved</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "—" : rejectedCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Rejected</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, contact, email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-slate-100 last:border-0 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={20} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No enquiries found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search or filter."
              : "No employer enquiries have been submitted yet."}
          </p>
        </div>
      ) : (
        <EmployerEnquiriesTable
          enquiries={filtered}
          onView={(enquiry) => {
            setSelectedEnquiry(enquiry);
            setDrawerOpen(true);
          }}
        />
      )}

      <EmployerDetailsDrawer
        open={drawerOpen}
        employer={selectedEnquiry}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEnquiry(null);
        }}
        onMutated={handleInvalidate}
      />
    </div>
  );
}
