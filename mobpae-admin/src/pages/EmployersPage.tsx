import { useEffect, useState } from "react";
import EmployersTable from "../components/employers/EmployersTable";
import EmployerManagementDrawer from "../components/employers/EmployerManagementDrawer";
import { getEmployers } from "../services/employerService";
import { Search } from "lucide-react";

type Employer = {
  id: string;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  payrollDate: number;
  payrollCutoffDate: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

export default function EmployersPage() {
  const [loading, setLoading] = useState(true);

  const [employers, setEmployers] = useState<Employer[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadEmployers() {
      try {
        const data = await getEmployers();
        setEmployers(data);
      } catch (error) {
        console.error("Failed to load employers", error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployers();
  }, []);

  const filteredEmployers = employers.filter((employer) => {
    const matchesSearch =
      employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.companyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || employer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading employers...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Employers</h1>

        <p className="text-slate-500 mt-2">Manage onboarded employers.</p>
      </div>

      {/* Search & Filters */}
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search employers..."
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

        {/* Status Filters */}
        <div className="flex items-center gap-2">
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
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-green-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setStatusFilter("SUSPENDED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "SUSPENDED"
                ? "bg-red-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredEmployers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Employers Found
          </h3>

          <p className="text-slate-500 mt-2">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <EmployersTable
          employers={filteredEmployers}
          onView={(employer) => {
            setSelectedEmployer(employer);
            setDrawerOpen(true);
          }}
        />
      )}

      <EmployerManagementDrawer
        open={drawerOpen}
        employer={selectedEmployer}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployer(null);
        }}
      />
    </div>
  );
}
