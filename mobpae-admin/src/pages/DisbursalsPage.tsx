import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import DisbursalStats from "../components/disbursals/DisbursalStats";
import DisbursalsTable from "../components/disbursals/DisbursalsTable";
import DisbursalDrawer from "../components/disbursals/DisbursalDrawer";

import { getDisbursals } from "../services/disbursalService";
import type { Disbursal } from "../types/disbursal";

export default function DisbursalsPage() {
  const [loading, setLoading] = useState(true);

  const [disbursals, setDisbursals] = useState<Disbursal[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedDisbursal, setSelectedDisbursal] = useState<Disbursal | null>(
    null
  );

  useEffect(() => {
    async function loadDisbursals() {
      try {
        const data = await getDisbursals();

        console.log("DISBURSALS", data);
        setDisbursals(data || []);
      } catch (error) {
        console.error("Failed to load disbursals", error);
      } finally {
        setLoading(false);
      }
    }

    loadDisbursals();
  }, []);

  const filteredDisbursals = disbursals.filter((disbursal) => {
    const matchesSearch =
      disbursal.salaryRequest.employee.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      disbursal.salaryRequest.employee.employeeCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      disbursal.salaryRequest.employee.employer.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || disbursal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading disbursals...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Disbursals</h1>

        <p className="text-slate-500 mt-2">
          Track and manage salary disbursals.
        </p>
      </div>

      {/* Stats */}
      <DisbursalStats disbursals={disbursals} />

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search disbursals..."
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
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>

          <button
            onClick={() => setStatusFilter("DISBURSED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "DISBURSED"
                ? "bg-green-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Disbursed
          </button>

          <button
            onClick={() => setStatusFilter("FAILED")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "FAILED"
                ? "bg-red-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredDisbursals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Disbursals Found
          </h3>

          <p className="text-slate-500 mt-2">
            Disbursals will appear here once salary requests are approved and
            processed.
          </p>
        </div>
      ) : (
        <DisbursalsTable
          disbursals={filteredDisbursals}
          onView={(disbursal) => {
            setSelectedDisbursal(disbursal);
            setDrawerOpen(true);
          }}
        />
      )}

      <DisbursalDrawer
        open={drawerOpen}
        disbursal={selectedDisbursal}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDisbursal(null);
        }}
      />
    </div>
  );
}
