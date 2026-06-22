import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getEmployees } from "../services/employeeService";
import type { Employee, EmploymentStatus } from "../types/employee";
import EmployeesTable from "../components/employees/EmployeesTable";
import EmployeeDrawer from "../components/employees/EmployeeDrawer";

const CHIP_ON = "bg-[#191A2E] text-white border-[#191A2E]";
const CHIP_OFF = "bg-white border-[#E4E4EF] text-[#62657A] hover:border-[#E4E4EF] hover:text-[#62657A]";

export default function EmployeesPage() {
  const { data: employees = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmploymentStatus>("ALL");
  const [employerFilter, setEmployerFilter] = useState("ALL");
  const [selected, setSelected] = useState<Employee | null>(null);

  const employers = [...new Map(employees.map((e) => [e.employer.id, e.employer])).values()];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || e.employmentStatus === statusFilter;
    const matchEmployer = employerFilter === "ALL" || e.employer.id === employerFilter;
    return matchSearch && matchStatus && matchEmployer;
  });

  const counts = {
    ACTIVE: employees.filter((e) => e.employmentStatus === "ACTIVE").length,
    INACTIVE: employees.filter((e) => e.employmentStatus === "INACTIVE").length,
    appActive: employees.filter((e) => e.appActivated).length,
  };

  const pipeline = [
    { label: "Active",      key: "ACTIVE" as const,   value: counts.ACTIVE,     color: "bg-[#7679FF]", text: "text-[#7679FF]" },
    { label: "Inactive",    key: "INACTIVE" as const,  value: counts.INACTIVE,   color: "bg-red-300",     text: "text-red-500"     },
    { label: "App Enabled", key: null,                  value: counts.appActive,  color: "bg-[#7679FF]",    text: "text-[#7679FF]"    },
    { label: "Total",       key: null,                  value: employees.length,  color: "bg-[#D4D5E0]",   text: "text-[#62657A]"   },
  ];

  return (
    <div className="p-5 space-y-4">
      <div>
        <h1 className="text-[15px] font-[500] text-[#191A2E] leading-none">Employees</h1>
        <p className="text-[11px] text-[#62657A] mt-1.5">Manage employee accounts across all employers</p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-lg px-4 py-2.5">
          Could not load employees. Check that the backend is running.
        </div>
      )}

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {pipeline.map(({ label, key, value, color, text }) => {
          const pct = employees.length > 0 ? Math.round((value / employees.length) * 100) : 0;
          const isActive = key !== null && statusFilter === key;
          return (
            <button
              key={label}
              onClick={() => key && setStatusFilter(statusFilter === key ? "ALL" : key)}
              className={`bg-white border rounded-lg p-3.5 text-left transition-colors ${isActive ? "border-[#E4E4EF]" : "border-[#E4E4EF] hover:border-[#E4E4EF]"} ${!key ? "cursor-default" : "cursor-pointer"}`}
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.06em] text-[#62657A] leading-none">{label}</p>
              <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${text} ${isLoading ? "opacity-20 animate-pulse" : ""}`}>{value}</p>
              <div className="h-[3px] rounded-full bg-[#F0F0F8] mt-2.5">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#62657A]" />
          <input
            type="text"
            placeholder="Search name, email, code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-56 text-[12px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] transition-colors"
          />
        </div>

        <select
          value={employerFilter}
          onChange={(e) => setEmployerFilter(e.target.value)}
          className="h-8 px-2.5 text-[12px] bg-white border border-[#E4E4EF] rounded-md outline-none focus:border-[#7679FF] text-[#62657A] transition-colors"
        >
          <option value="ALL">All employers</option>
          {employers.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.companyName}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`h-7 px-3 rounded-full text-[11px] font-[500] border transition-colors ${statusFilter === v ? CHIP_ON : CHIP_OFF}`}
            >
              {v === "ALL" ? "All" : v === "ACTIVE" ? `Active · ${counts.ACTIVE}` : `Inactive · ${counts.INACTIVE}`}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-[#62657A]">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F0F0F8] last:border-0">
              <div className="w-7 h-7 rounded-lg bg-[#F0F0F8] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-32 bg-[#F0F0F8] rounded animate-pulse" />
                <div className="h-2 w-20 bg-[#F0F0F8] rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-24 bg-[#F0F0F8] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[#F0F0F8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4EF] rounded-xl py-14 text-center">
          <p className="text-[13px] font-[500] text-[#62657A]">No employees found</p>
          <p className="text-[11px] text-[#62657A] mt-1">
            {search || statusFilter !== "ALL" || employerFilter !== "ALL"
              ? "Try adjusting your search or filters."
              : "No employees onboarded yet."}
          </p>
        </div>
      ) : (
        <EmployeesTable
          employees={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(emp) => setSelected(selected?.id === emp.id ? null : emp)}
        />
      )}

      <EmployeeDrawer
        open={selected !== null}
        employee={selected}
        onClose={() => setSelected(null)}
        onRefresh={() => void refetch()}
      />
    </div>
  );
}
