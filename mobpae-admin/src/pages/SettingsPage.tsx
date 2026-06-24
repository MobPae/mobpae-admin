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
      style={{ position: "relative", display: "inline-flex", alignItems: "center", height: 20, width: 36, borderRadius: 999, background: on ? "#6C4CFF" : "#E5E7EB", border: "none", cursor: "pointer", flexShrink: 0, opacity: loading ? 0.5 : 1, transition: "background 0.2s" }}
    >
      {loading
        ? <Loader2 size={10} style={{ position: "absolute", inset: 0, margin: "auto", color: "white" }} className="animate-spin" />
        : <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transform: on ? "translateX(18px)" : "translateX(3px)", transition: "transform 0.2s" }} />
      }
    </button>
  );
}

function SectionCard({ icon, color, title, children }: {
  icon: React.ReactNode; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{title}</p>
      </div>
      <div>{children}</div>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid #F3F4F6" }}>
        <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isEditingThis ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {prefix && <span style={{ fontSize: 12, color: "#6B7280" }}>{prefix}</span>}
                <input
                  autoFocus
                  type="text"
                  value={editing!.value}
                  onChange={e => setEditing({ key: k, value: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveMutation.mutate(editing!);
                    if (e.key === "Escape") setEditing(null);
                  }}
                  style={{ width: 96, height: 28, padding: "0 8px", fontSize: 12, fontWeight: 500, color: "#111827", border: "1px solid #E5E7EB", borderRadius: 8, outline: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", fontFamily: "inherit" }}
                />
                {suffix && <span style={{ fontSize: 12, color: "#6B7280" }}>{suffix}</span>}
              </div>
              <button
                onClick={() => saveMutation.mutate(editing!)}
                disabled={isSaving}
                style={{ width: 24, height: 24, borderRadius: 6, background: "#6C4CFF", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isSaving ? 0.5 : 1 }}
              >
                {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              </button>
              <button
                onClick={() => setEditing(null)}
                style={{ width: 24, height: 24, borderRadius: 6, background: "white", border: "1px solid #E5E7EB", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
                {shown ?? <span style={{ color: "#9CA3AF", fontWeight: 400 }}>Not set</span>}
              </span>
              <button
                onClick={() => setEditing({ key: k, value: raw })}
                style={{ width: 20, height: 20, borderRadius: 4, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", cursor: "pointer", opacity: 0.4 }}
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid #F3F4F6" }}>
        <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
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
      <div style={{ padding: "28px 32px" }}>
        <p style={{ fontSize: 13, color: "#6B7280" }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>Platform-wide configuration · hover any value to edit</p>
      </div>

      {/* Salary Advance Rules */}
      <SectionCard icon={<Settings2 size={13} color="#6C4CFF" />} color="#F3F0FF" title="Salary advance rules">
        {ADVANCE_RULES.map(r => <EditableRow key={r.key} k={r.key} label={r.label} prefix={r.prefix} suffix={r.suffix} />)}
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Eligibility Rules */}
        <SectionCard icon={<ShieldCheck size={13} color="#EF4444" />} color="#FEE2E2" title="Eligibility rules">
          {ELIGIBILITY_RULES.map(r => <ToggleRow key={r.key} k={r.key} label={r.label} />)}
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={<Bell size={13} color="#6C4CFF" />} color="#F3F0FF" title="Notifications">
          {NOTIFICATION_RULES.map(r => <ToggleRow key={r.key} k={r.key} label={r.label} />)}
        </SectionCard>
      </div>

      {/* Membership & Settlement */}
      <SectionCard icon={<Coins size={13} color="#D97706" />} color="#FEF3C7" title="Membership & settlement">
        {MEMBERSHIP_RULES.map(r => <EditableRow key={r.key} k={r.key} label={r.label} prefix={r.prefix} suffix={r.suffix} />)}
      </SectionCard>
    </div>
  );
}
