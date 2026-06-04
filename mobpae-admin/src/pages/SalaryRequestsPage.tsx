import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import SalaryRequestStats from "../components/salary-requests/SalaryRequestStats";
import SalaryRequestsTable from "../components/salary-requests/SalaryRequestsTable";
import SalaryRequestDrawer from "../components/salary-requests/SalaryRequestDrawer";

import { getSalaryRequests } from "../services/salaryRequestService";
import type { SalaryRequest } from "../types/salary-request";

export default function SalaryRequestsPage() {
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState<SalaryRequest[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<SalaryRequest | null>(
    null
  );

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getSalaryRequests();

        setRequests(data || []);
      } catch (error) {
        console.error("Failed to load salary requests", error);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee.employeeCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.employee.employer.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading salary requests...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Salary Requests</h1>

        <p className="text-slate-500 mt-2">
          Review and manage employee salary advance requests.
        </p>
      </div>

      {/* Stats */}
      <SalaryRequestStats requests={requests} />

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search requests..."
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
            onClick={() => setStatusFilter("SUBMITTED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "SUBMITTED"
                ? "bg-amber-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Submitted
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
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Salary Requests Found
          </h3>

          <p className="text-slate-500 mt-2">
            Salary requests will appear here once employees start requesting
            salary advances.
          </p>
        </div>
      ) : (
        <SalaryRequestsTable
          requests={filteredRequests}
          onView={(request) => {
            setSelectedRequest(request);
            setDrawerOpen(true);
          }}
        />
      )}

      <SalaryRequestDrawer
        open={drawerOpen}
        request={selectedRequest}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
}
