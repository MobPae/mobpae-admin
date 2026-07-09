import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MonitorCog, QrCode, Building2, Bell,
  Pencil, Check, X, Loader2,
} from "lucide-react";
import { getSettings, updateSetting } from "../services/settingsService";
import type { SettingsRecord } from "../types/settings";

// ── exact keys the backend reads ─────────────────────────────────────────────

const APP_TOGGLES = [
  { key: "app.maintenance_mode", label: "Maintenance mode" },
];

const APP_TEXT = [
  { key: "app.maintenance_message", label: "Maintenance message", wide: true },
];

const MEMBERSHIP_TEXT = [
  { key: "membership.payment_upi_id",       label: "UPI ID",       placeholder: "e.g. mobpae@okicici" },
  { key: "membership.payment_beneficiary",  label: "Beneficiary",  placeholder: "e.g. MobPae Fintech Pvt Ltd" },
  { key: "membership.payment_instructions", label: "Instructions", placeholder: "e.g. Pay using any UPI app…", wide: true },
];

const SETTLEMENT_FIELDS = [
  { key: "employer.grace_days",          label: "Grace period",  suffix: "days" },
  { key: "employer.late_fee_percentage", label: "Late fee",      suffix: "%"    },
];

const NOTIFICATION_TOGGLES = [
  { key: "notifications.disbursal_enabled",          label: "Disbursal notifications"          },
  { key: "notifications.repayment_reminder_enabled", label: "Repayment reminder notifications" },
];

const NOTIFICATION_FIELDS = [
  { key: "notifications.repayment_reminder_days_before", label: "Reminder days before due", suffix: "days" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function get(rec: SettingsRecord, key: string) {
  return rec[key] ?? "";
}

function isOn(rec: SettingsRecord, key: string) {
  const v = rec[key];
  return v === "true" || v === "1" || v === "yes";
}

// ── sub-components ────────────────────────────────────────────────────────────

function Toggle({ on, loading, onChange }: { on: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      style={{
        position: "relative", display: "inline-flex", alignItems: "center",
        height: 20, width: 36, borderRadius: 999,
        background: on ? "#315eff" : "#E5E7EB",
        border: "none", cursor: "pointer", flexShrink: 0,
        opacity: loading ? 0.5 : 1, transition: "background 0.2s",
      }}
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
        <div style={{ width: 26, height: 26, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── row types ─────────────────────────────────────────────────────────────────

interface ToggleRowProps { k: string; label: string; settings: SettingsRecord; onToggle: (k: string) => void; toggling: string | null; isPending: boolean; }
function ToggleRow({ k, label, settings, onToggle, toggling, isPending }: ToggleRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid #F3F4F6" }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <Toggle
        on={isOn(settings, k)}
        loading={toggling === k && isPending}
        onChange={() => onToggle(k)}
      />
    </div>
  );
}

interface EditState { key: string; value: string }

interface TextRowProps {
  k: string; label: string; suffix?: string; placeholder?: string; wide?: boolean;
  settings: SettingsRecord;
  editing: EditState | null; setEditing: (e: EditState | null) => void;
  onSave: (e: EditState) => void; isPending: boolean; pendingKey: string | undefined;
}
function TextRow({ k, label, suffix, placeholder, wide, settings, editing, setEditing, onSave, isPending, pendingKey }: TextRowProps) {
  const raw = get(settings, k);
  const isEditingThis = editing?.key === k;
  const isSaving = isPending && pendingKey === k;

  return (
    <div style={{ display: "flex", alignItems: wide ? "flex-start" : "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid #F3F4F6", gap: 12 }}>
      <span style={{ fontSize: 13, color: "#6B7280", flexShrink: 0, paddingTop: wide ? 2 : 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1, justifyContent: "flex-end" }}>
        {isEditingThis ? (
          <>
            <div style={{ display: "flex", flexDirection: wide ? "column" : "row", alignItems: "flex-end", gap: 4, flex: 1 }}>
              {wide ? (
                <textarea
                  autoFocus
                  value={editing!.value}
                  onChange={e => setEditing({ key: k, value: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, fontWeight: 500, color: "#111827", border: "1px solid #315eff", borderRadius: 8, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    autoFocus
                    type="text"
                    value={editing!.value}
                    placeholder={placeholder}
                    onChange={e => setEditing({ key: k, value: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === "Enter") onSave(editing!);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    style={{ width: 180, height: 28, padding: "0 8px", fontSize: 12, fontWeight: 500, color: "#111827", border: "1px solid #315eff", borderRadius: 8, outline: "none", fontFamily: "inherit" }}
                  />
                  {suffix && <span style={{ fontSize: 12, color: "#6B7280", flexShrink: 0 }}>{suffix}</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => onSave(editing!)}
                  disabled={isSaving}
                  style={{ width: 24, height: 24, borderRadius: 6, background: "#315eff", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isSaving ? 0.5 : 1 }}
                >
                  {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  style={{ width: 24, height: 24, borderRadius: 6, background: "white", border: "1px solid #E5E7EB", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: raw ? 600 : 400, color: raw ? "#111827" : "#9CA3AF", textAlign: "right", maxWidth: 260, wordBreak: "break-all" }}>
              {raw ? `${raw}${suffix ? ` ${suffix}` : ""}` : (placeholder ?? "Not set")}
            </span>
            <button
              onClick={() => setEditing({ key: k, value: raw })}
              style={{ width: 20, height: 20, borderRadius: 4, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", cursor: "pointer", opacity: 0.4, flexShrink: 0 }}
            >
              <Pencil size={10} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

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
      toast.success("Saved", { description: `${vars.key} updated` });
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

  const sharedTextProps = {
    settings, editing, setEditing,
    onSave: (e: EditState) => saveMutation.mutate(e),
    isPending: saveMutation.isPending,
    pendingKey: saveMutation.variables?.key,
  };

  if (isLoading) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <p style={{ fontSize: 13, color: "#6B7280" }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Global Settings
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>
          Platform-wide configuration — changes take effect immediately. Lending rules live in{" "}
          <a href="/loan-product" style={{ color: "#315eff", textDecoration: "underline" }}>Loan Product Config</a>.
        </p>
      </div>

      {/* App */}
      <SectionCard icon={<MonitorCog size={13} color="#315eff" />} color="#EEF2FF" title="App">
        {APP_TOGGLES.map(r => (
          <ToggleRow key={r.key} k={r.key} label={r.label} settings={settings} onToggle={handleToggle} toggling={toggling} isPending={saveMutation.isPending} />
        ))}
        {APP_TEXT.map(r => (
          <TextRow key={r.key} k={r.key} label={r.label} wide={r.wide} {...sharedTextProps} />
        ))}
      </SectionCard>

      {/* Membership Payment */}
      <SectionCard icon={<QrCode size={13} color="#D97706" />} color="#FEF3C7" title="Membership payment">
        <p style={{ fontSize: 11.5, color: "#9CA3AF", padding: "8px 20px 0", margin: 0 }}>
          Shown to employees when paying for membership
        </p>
        {MEMBERSHIP_TEXT.map(r => (
          <TextRow key={r.key} k={r.key} label={r.label} placeholder={r.placeholder} wide={r.wide} {...sharedTextProps} />
        ))}
      </SectionCard>

      {/* Employer Settlement */}
      <SectionCard icon={<Building2 size={13} color="#EF4444" />} color="#FEE2E2" title="Employer settlement">
        {SETTLEMENT_FIELDS.map(r => (
          <TextRow key={r.key} k={r.key} label={r.label} suffix={r.suffix} {...sharedTextProps} />
        ))}
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={<Bell size={13} color="#315eff" />} color="#EEF2FF" title="Notifications">
        {NOTIFICATION_TOGGLES.map(r => (
          <ToggleRow key={r.key} k={r.key} label={r.label} settings={settings} onToggle={handleToggle} toggling={toggling} isPending={saveMutation.isPending} />
        ))}
        {NOTIFICATION_FIELDS.map(r => (
          <TextRow key={r.key} k={r.key} label={r.label} suffix={r.suffix} {...sharedTextProps} />
        ))}
      </SectionCard>
    </div>
  );
}
