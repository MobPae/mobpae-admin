import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { getKycDocuments } from "../services/kycService";
import type { KycStatusFilter } from "../services/kycService";
import KycTable from "../components/kyc/KycTable";
import KycDrawer from "../components/kyc/KycDrawer";
import type { KycDocument } from "../types/kyc";

const CHIPS: { key: KycStatusFilter; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "VERIFIED", label: "Verified" },
  { key: "REJECTED", label: "Rejected" },
];

export default function KycVerificationPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<KycStatusFilter>("PENDING");
  const [selected, setSelected] = useState<KycDocument | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["kyc", filter],
    queryFn: () => getKycDocuments(filter),
  });

  const pending  = data.filter(d => d.status === "PENDING").length;
  const verified = data.filter(d => d.status === "VERIFIED").length;
  const rejected = data.filter(d => d.status === "REJECTED").length;
  const total    = data.length;

  const rows = data.filter(d => {
    const q = search.toLowerCase();
    return (
      d.employee.name.toLowerCase().includes(q) ||
      d.employee.employeeCode.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">KYC Verification</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Review and verify employee KYC documents</p>
      </div>

      {/* Pipeline strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Clock size={14} />,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending",  val: pending  },
          { icon: <CheckCircle size={14} />, color: "text-emerald-500", bg: "bg-emerald-50", label: "Verified", val: verified },
          { icon: <XCircle size={14} />,     color: "text-red-500",     bg: "bg-red-50",     label: "Rejected", val: rejected },
          { icon: <FileText size={14} />,    color: "text-slate-500",   bg: "bg-slate-50",   label: "Total",    val: total    },
        ].map(({ icon, color, bg, label, val }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-[20px] font-[600] text-slate-900 leading-none tabular-nums">{val}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, document type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-4 text-[12px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-72 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {CHIPS.map(c => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`h-7 px-3 rounded-full text-[11px] font-[500] transition-colors ${
                  active ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-400">Loading KYC documents…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-10 text-center">
          <p className="text-[13px] text-slate-500 font-[500]">No documents found</p>
          <p className="text-[12px] text-slate-400 mt-1">No {filter.toLowerCase()} KYC documents match this view.</p>
        </div>
      ) : (
        <KycTable
          documents={rows}
          selectedId={selected?.id ?? null}
          onSelect={d => setSelected(d)}
        />
      )}

      <KycDrawer
        open={!!selected}
        document={selected}
        onClose={() => setSelected(null)}
        onCompleted={() => {
          qc.invalidateQueries({ queryKey: ["kyc"] });
          setSelected(null);
        }}
      />
    </div>
  );
}
