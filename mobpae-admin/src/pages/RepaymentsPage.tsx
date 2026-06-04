import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import RepaymentStats from "../components/repayments/RepaymentStats";
import RepaymentsTable from "../components/repayments/RepaymentsTable";
import RepaymentDrawer from "../components/repayments/RepaymentDrawer";

import { getRepayments } from "../services/repaymentService";
import type { Repayment } from "../types/repayment";

export default function RepaymentsPage() {
  const [loading, setLoading] = useState(true);

  const [repayments, setRepayments] = useState<Repayment[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedRepayment, setSelectedRepayment] = useState<Repayment | null>(
    null
  );

  useEffect(() => {
    async function loadRepayments() {
      try {
        const data = await getRepayments();

        setRepayments(data || []);
      } catch (error) {
        console.error("Failed to load repayments", error);
      } finally {
        setLoading(false);
      }
    }

    loadRepayments();
  }, []);

  const filteredRepayments = repayments.filter((repayment) => {
    const matchesSearch =
      repayment.salaryRequest.employee.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      repayment.salaryRequest.employee.employeeCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      repayment.salaryRequest.employee.employer.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || repayment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading repayments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Repayments</h1>

        <p className="text-slate-500 mt-2">
          Track employee salary advance repayments.
        </p>
      </div>

      <RepaymentStats repayments={repayments} />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search repayments..."
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
            onClick={() => setStatusFilter("PAID")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "PAID"
                ? "bg-green-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Paid
          </button>

          <button
            onClick={() => setStatusFilter("OVERDUE")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "OVERDUE"
                ? "bg-red-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {filteredRepayments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Repayments Found
          </h3>

          <p className="text-slate-500 mt-2">
            Repayments will appear here once salary advances are repaid.
          </p>
        </div>
      ) : (
        <RepaymentsTable
          repayments={filteredRepayments}
          onView={(repayment) => {
            setSelectedRepayment(repayment);
            setDrawerOpen(true);
          }}
        />
      )}

      <RepaymentDrawer
        open={drawerOpen}
        repayment={selectedRepayment}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRepayment(null);
        }}
      />
    </div>
  );
}
