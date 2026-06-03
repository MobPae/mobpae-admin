import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import EmployerStats from "../components/employer-enquiries/EmployerStats";
import EmployerEnquiriesTable from "../components/employer-enquiries/EmployerEnquiriesTable";
import EmployerDetailsDrawer from "../components/employer-enquiries/EmployerDetailsDrawer";
import type { EmployerEnquiry } from "../types/employer-enquiry";
import { getEmployerEnquiries } from "../services/employerEnquiryService";

export default function EmployerEnquiriesPage() {
  const [loading, setLoading] = useState(true);

  const [enquiries, setEnquiries] = useState<EmployerEnquiry[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedEmployer, setSelectedEmployer] =
    useState<EmployerEnquiry | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadEnquiries = async () => {
    try {
      const data = await getEmployerEnquiries();

      setEnquiries(data);
    } catch (error) {
      console.error("Failed to load employer enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || enquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading employer enquiries...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Employer Onboarding
          </h1>

          <p className="text-slate-500 mt-2">
            Review and approve employer onboarding requests.
          </p>
        </div>
      </div>

      {/* Stats */}
      <EmployerStats />

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              h-10
              pl-10
              pr-4
              text-sm
              bg-white
              border
              border-slate-200
              rounded-xl
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStatusFilter("NEW")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "NEW"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            New
          </button>

          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "APPROVED"
                ? "bg-green-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Approved
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Employer Enquiries
          </h3>

          <p className="ttext-sm text-slate-500 mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <EmployerEnquiriesTable
          enquiries={filteredEnquiries}
          onView={(employer) => {
            setSelectedEmployer(employer);
            setDrawerOpen(true);
          }}
        />
      )}

      <EmployerDetailsDrawer
        open={drawerOpen}
        employer={selectedEmployer}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployer(null);
        }}
        onApproved={loadEnquiries}
      />
    </div>
  );
}
