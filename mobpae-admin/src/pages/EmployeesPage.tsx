import { useEffect, useState } from "react";
import { Search, Users, UserCheck, Clock3, Ban } from "lucide-react";

import { getEmployees } from "../services/employeeService";

import type { Employee } from "../types/employee";

import EmployeesTable from "../components/employees/EmployeesTable";

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEmployer, setSelectedEmployer] = useState("ALL");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();

        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees", error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const employers = [
    ...new Map(
      employees.map((employee) => [employee.employer.id, employee.employer])
    ).values(),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode

        .toLowerCase()

        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || employee.status === statusFilter;

    const matchesEmployer =
      selectedEmployer === "ALL" || employee.employer.id === selectedEmployer;

    return matchesSearch && matchesStatus && matchesEmployer;
  });

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "ACTIVE"
  ).length;

  const pendingEmployees = employees.filter(
    (employee) => employee.status === "PENDING"
  ).length;

  const blockedEmployees = employees.filter(
    (employee) =>
      employee.status === "BLOCKED" || employee.status === "INACTIVE"
  ).length;

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage employee accounts across all employers.
        </p>
      </div>

      {/* KPI Cards */}

      {/* Search & Filters */}
      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search employees..."
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

          {/* Employer Filter */}
          <select
            value={selectedEmployer}
            onChange={(e) => setSelectedEmployer(e.target.value)}
            className="
        h-10
        px-4
        text-sm
        bg-white
        border
        border-slate-200
        rounded-xl
        outline-none
        focus:border-blue-500
        min-w-[220px]
      "
          >
            <option value="ALL">All Employers</option>

            {employers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                {employer.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterPill
            active={statusFilter === "ALL"}
            label="All"
            onClick={() => setStatusFilter("ALL")}
          />

          <FilterPill
            active={statusFilter === "ACTIVE"}
            label="Active"
            onClick={() => setStatusFilter("ACTIVE")}
          />

          <FilterPill
            active={statusFilter === "PENDING"}
            label="Pending"
            onClick={() => setStatusFilter("PENDING")}
          />

          <FilterPill
            active={statusFilter === "BLOCKED"}
            label="Blocked"
            onClick={() => setStatusFilter("BLOCKED")}
          />
        </div>
      </div>

      {/* Table */}
      <EmployeesTable employees={filteredEmployees} />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className={`
        ${color}
        rounded-2xl
        px-5
        py-4
        text-white
        min-h-[92px]
        flex
        items-center
        justify-between
      `}
    >
      <div>
        <p className="text-xs font-medium text-white/80">{title}</p>

        <h2 className="text-2xl font-semibold mt-1">{value}</h2>
      </div>

      <Icon size={24} className="opacity-80" />
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
