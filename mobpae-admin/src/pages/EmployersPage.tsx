import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import EmployersTable from "../components/employers/EmployersTable";
import EmployerManagementDrawer from "../components/employers/EmployerManagementDrawer";
import CreateEmployerDrawer from "../components/employers/CreateEmployerDrawer";
import type { Employer, EmployerStatus } from "../types/employer";
import { getEmployers } from "../services/employerService";

const STATUS_CHIPS: { label: string; value: "ALL" | EmployerStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Rejected", value: "REJECTED" },
];

const CHIP_ON = "bg-slate-900 text-white border-slate-900";
const CHIP_OFF = "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700";

export default function EmployersPage() {
  const queryClient = useQueryClient();

  const { data: employers = [], isLoading, isError } = useQuery({
    queryKey: ["employers"],
    queryFn: getEmployers,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EmployerStatus>("ALL");
  const [selected, setSelected] = useState<Employer | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const counts: Record<EmployerStatus, number> = {
    ACTIVE:    employers.filter((e) => e.status === "ACTIVE").length,
    PENDING:   employers.filter((e) => e.status === "PENDING").length,
    APPROVED:  employers.filter((e) => e.status === "APPROVED").length,
    REJECTED:  employers.filter((e) => e.status === "REJECTED").length,
    INACTIVE:  employers.filter((e) => e.status === "INACTIVE").length,
    SUSPENDED: employers.filter((e) => e.status === "SUSPENDED").length,
  };

  const filtered = employers.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.companyName.toLowerCase().includes(q) ||
      e.companyCode.toLowerCase().includes(q) ||
      e.contactPerson.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pipeline = [
    { label: "Active", key: "ACTIVE" as const, color: "bg-green-400", text: "text-green-600" },
    { label: "Pending", key: "PENDING" as const, color: "bg-amber-400", text: "text-amber-600" },
    { label: "Suspended", key: "SUSPENDED" as const, color: "bg-red-300", text: "text-red-500" },
    { label: "Rejected", key: "REJECTED" as const, color: "bg-slate-300", text: "text-slate-500" },
  ];

  const total = employers.length;

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-[500] text-slate-900 leading-none">Employers</h1>
          <p className="text-[11px] text-slate-400 mt-1.5">Manage employer accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-8 px-3.5 rounded-lg text-white text-[12px] font-[600] flex items-center gap-1.5 transition-colors"
          style={{ background: "#c4522a" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#a8411f"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c4522a"; }}
        >
          <Plus size={13} />
          Add Employer
        </button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-lg px-4 py-2.5">
          Could not load employers. Check that the backend is running.
        </div>
      )}

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {pipeline.map(({ label, key, color, text }) => {
          const count = counts[key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
              className={`bg-white border rounded-lg p-3.5 text-left transition-colors ${
                statusFilter === key ? "border-slate-300" : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <p className="text-[10px] font-[500] uppercase tracking-[0.06em] text-slate-400 leading-none">
                {label}
              </p>
              <p className={`text-[22px] font-[500] tracking-tight leading-none mt-2.5 ${text} ${
                isLoading ? "opacity-20 animate-pulse" : ""
              }`}>
                {count}
              </p>
              <div className="h-[3px] rounded-full bg-slate-100 mt-2.5">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, code, contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 w-56 text-[12px] bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors"
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
                <span className="ml-1 opacity-60">· {counts[chip.value as EmployerStatus]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-[11px] text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-2 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-lg py-14 text-center">
          <p className="text-[13px] font-[500] text-slate-700">No employers found</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filter." : "No employers onboarded yet."}
          </p>
        </div>
      ) : (
        <EmployersTable
          employers={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(emp) => setSelected(selected?.id === emp.id ? null : emp)}
        />
      )}

      <EmployerManagementDrawer
        open={selected !== null}
        employer={selected}
        onClose={() => setSelected(null)}
        onMutated={() => void queryClient.invalidateQueries({ queryKey: ["employers"] })}
      />

      <CreateEmployerDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

    </div>
  );
}
