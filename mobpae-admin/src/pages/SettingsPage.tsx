import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings2, ShieldCheck, Bell, Coins, Pencil, Check, X, Loader2 } from "lucide-react";
import { getSettings, updateSetting } from "../services/settingsService";
import type { SettingsRecord } from "../types/settings";

// ── exact keys from API ───────────────────────────────────────────────────────

const ADVANCE_RULES = [
  { key: "advancePercentage",        label: "Advance percentage",       prefix: "",  suffix: "%" },
  { key: "minimumSalary",            label: "Minimum salary",           prefix: "₹", suffix: ""  },
  { key: "maximumAdvance",           label: "Maximum advance",          prefix: "₹", suffix: ""  },
  { key: "interestChargePercentage", label: "Interest charge percentage", prefix: "", suffix: "%" },
];

const ELIGIBILITY_RULES = [
  { key: "requireKyc",                          label: "Require KYC"                         },
  { key: "requireBankVerification",             label: "Require bank verification"           },
  { key: "allowMultipleRequestsPerCycle",       label: "Allow multiple requests per cycle"   },
  { key: "allowRequestWithOutstandingBalance",  label: "Allow request with outstanding balance" },
];

const NOTIFICATION_RULES = [
  { key: "salaryRequestAlert",    label: "Salary request alert"     },
  { key: "repaymentAlert",        label: "Repayment alert"          },
  { key: "kycAlert",              label: "KYC alert"                },
  { key: "bankVerificationAlert", label: "Bank verification alert"  },
];

const MEMBERSHIP_RULES = [
  { key: "MEMBERSHIP_AMOUNT",           label: "Membership amount",          prefix: "₹", suffix: ""      },
  { key: "MEMBERSHIP_VALIDITY_DAYS",    label: "Membership validity days",   prefix: "",  suffix: " days" },
  { key: "EMPLOYER_GRACE_DAYS",         label: "Employer grace days",        prefix: "",  suffix: " days" },
  { key: "EMPLOYER_LATE_FEE_PERCENTAGE",label: "Employer late fee",          prefix: "",  suffix: "%"     },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function get(rec: SettingsRecord, key: string) {
  return rec[key] ?? "";
}

function isOn(rec: SettingsRecord, key: string) {
  const v = rec[key];
  return v === "true" || v === "1" || v === "yes";
}

function displayValue(raw: string, prefix: string, suffix: string) {
  if (!raw) return null;
  if (prefix === "₹") return `₹${Number(raw).toLocaleString("en-IN")}`;
  return `${prefix}${raw}${suffix}`;
}

// ── components ────────────────────────────────────────────────────────────────

function Toggle({ on, loading, onChange }: { on: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      style={{ height: "20px", width: "36px" }}
      className={`relative inline-flex items-center rounded-full transition-colors disabled:opacity-50 flex-shrink-0 ${on ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      {loading
        ? <Loader2 size={10} className="absolute inset-0 m-auto text-white animate-spin" />
        : <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      }
    </button>
  );
}

function SectionCard({ icon, color, title, children }: {
  icon: React.ReactNode; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center`}>{icon}</div>
        <p className="text-[13px] font-[500] text-slate-800">{title}</p>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

interface EditState { key: string; value: string }

export default function SettingsPage() {
  const qc = useQueryClient();
  const [editing,  setEditing]  = useState<EditState | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const { data: settings = {}, isLoading } = useQuery<SettingsRecord>({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const saveMutation = useMutation({
    mutationFn: ({ key, value }: EditState) => updateSetting(key, value),
    onSuccess: (_, vars) => {
      toast.success("Setting saved", { description: `${vars.key} → ${vars.value}` });
      qc.invalidateQueries({ queryKey: ["settings"] });
      setEditing(null);
      setToggling(null);
    },
    onError: (err: unknown) => {
      toast.error("Save failed", { description: err instanceof Error ? err.message : "Unexpected error" });
      setToggling(null);
    },
  });

  const handleToggle = (key: string) => {
    const next = isOn(settings, key) ? "false" : "true";
    setToggling(key);
    saveMutation.mutate({ key, value: next });
  };

  function EditableRow({ k, label, prefix, suffix }: { k: string; label: string; prefix: string; suffix: string }) {
    const raw           = get(settings, k);
    const isEditingThis = editing?.key === k;
    const isSaving      = saveMutation.isPending && saveMutation.variables?.key === k;
    const shown         = displayValue(raw, prefix, suffix);

    return (
      <div className="flex items-center justify-between px-5 py-3 group min-h-[44px]">
        <span className="text-[12px] text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          {isEditingThis ? (
            <>
              <div className="flex items-center gap-1">
                {prefix && <span className="text-[12px] text-slate-400">{prefix}</span>}
                <input
                  autoFocus
                  type="text"
                  value={editing!.value}
                  onChange={e => setEditing({ key: k, value: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveMutation.mutate(editing!);
                    if (e.key === "Escape") setEditing(null);
                  }}
                  className="w-24 h-7 px-2 text-[12px] font-[500] text-slate-900 border border-blue-300 rounded-md outline-none focus:border-blue-500 tabular-nums text-right"
                />
                {suffix && <span className="text-[12px] text-slate-400">{suffix}</span>}
              </div>
              <button
                onClick={() => saveMutation.mutate(editing!)}
                disabled={isSaving}
                className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="w-6 h-6 rounded-md border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <>
              <span className="text-[12px] font-[600] text-slate-900 tabular-nums">
                {shown ?? <span className="text-slate-300 font-[400]">Not set</span>}
              </span>
              <button
                onClick={() => setEditing({ key: k, value: raw })}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity"
              >
                <Pencil size={10} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function ToggleRow({ k, label }: { k: string; label: string }) {
    return (
      <div className="flex items-center justify-between px-5 py-3 min-h-[44px]">
        <span className="text-[12px] text-slate-500">{label}</span>
        <Toggle
          on={isOn(settings, k)}
          loading={toggling === k && saveMutation.isPending}
          onChange={() => handleToggle(k)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-8 py-6">
        <p className="text-[13px] text-slate-400">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-[600] text-slate-900 tracking-[-0.01em]">Settings</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Platform-wide configuration · hover any value to edit</p>
      </div>

      {/* Salary Advance Rules */}
      <SectionCard icon={<Settings2 size={13} className="text-blue-600" />} color="bg-blue-50" title="Salary advance rules">
        {ADVANCE_RULES.map(r => <EditableRow key={r.key} k={r.key} label={r.label} prefix={r.prefix} suffix={r.suffix} />)}
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Eligibility Rules */}
        <SectionCard icon={<ShieldCheck size={13} className="text-red-500" />} color="bg-red-50" title="Eligibility rules">
          {ELIGIBILITY_RULES.map(r => <ToggleRow key={r.key} k={r.key} label={r.label} />)}
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={<Bell size={13} className="text-violet-600" />} color="bg-violet-50" title="Notifications">
          {NOTIFICATION_RULES.map(r => <ToggleRow key={r.key} k={r.key} label={r.label} />)}
        </SectionCard>
      </div>

      {/* Membership & Settlement */}
      <SectionCard icon={<Coins size={13} className="text-amber-600" />} color="bg-amber-50" title="Membership & settlement">
        {MEMBERSHIP_RULES.map(r => <EditableRow key={r.key} k={r.key} label={r.label} prefix={r.prefix} suffix={r.suffix} />)}
      </SectionCard>
    </div>
  );
}
