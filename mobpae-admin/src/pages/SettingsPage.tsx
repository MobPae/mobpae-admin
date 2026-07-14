import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MonitorCog, Building2, Bell,
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
        background: on ? "var(--color-brand)" : "var(--color-edge)",
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
    <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--color-edge)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── row types ─────────────────────────────────────────────────────────────────

interface ToggleRowProps { k: string; label: string; settings: SettingsRecord; onToggle: (k: string) => void; toggling: string | null; isPending: boolean; }
function ToggleRow({ k, label, settings, onToggle, toggling, isPending }: ToggleRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid var(--color-edge-2)" }}>
      <span style={{ fontSize: 13, color: "var(--color-ink-3)" }}>{label}</span>
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
    <div style={{ display: "flex", alignItems: wide ? "flex-start" : "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid var(--color-edge-2)", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--color-ink-3)", flexShrink: 0, paddingTop: wide ? 2 : 0 }}>{label}</span>
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
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, fontWeight: 500, color: "var(--color-ink)", border: "1px solid var(--color-brand)", borderRadius: 8, outline: "none", resize: "vertical", fontFamily: "inherit" }}
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
                    style={{ width: 180, height: 28, padding: "0 8px", fontSize: 12, fontWeight: 500, color: "var(--color-ink)", border: "1px solid var(--color-brand)", borderRadius: 8, outline: "none", fontFamily: "inherit" }}
                  />
                  {suffix && <span style={{ fontSize: 12, color: "var(--color-ink-3)", flexShrink: 0 }}>{suffix}</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => onSave(editing!)}
                  disabled={isSaving}
                  style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-brand)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isSaving ? 0.5 : 1 }}
                >
                  {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  style={{ width: 24, height: 24, borderRadius: 6, background: "white", border: "1px solid var(--color-edge)", color: "var(--color-ink-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: raw ? 600 : 400, color: raw ? "var(--color-ink)" : "var(--color-ink-4)", textAlign: "right", maxWidth: 260, wordBreak: "break-all" }}>
              {raw ? `${raw}${suffix ? ` ${suffix}` : ""}` : (placeholder ?? "Not set")}
            </span>
            <button
              onClick={() => setEditing({ key: k, value: raw })}
              style={{ width: 20, height: 20, borderRadius: 4, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-3)", cursor: "pointer", opacity: 0.4, flexShrink: 0 }}
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

  const { data: settings = {}, isLoading, isError, refetch } = useQuery<SettingsRecord>({
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

  if (isError) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Failed to load settings.</span>
          <button onClick={() => void refetch()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ height: 24, width: 200, background: "var(--color-surface-muted)", borderRadius: 4, marginBottom: 8 }} className="animate-pulse" />
          <div style={{ height: 14, width: 340, background: "var(--color-surface-muted)", borderRadius: 4 }} className="animate-pulse" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[0, 1].map(col => (
            <div key={col} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[0, 1].map(card => (
                <div key={card} style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--color-edge)" }}>
                    <div style={{ height: 14, width: 100, background: "var(--color-surface-muted)", borderRadius: 4 }} className="animate-pulse" />
                  </div>
                  {[0, 1].map(row => (
                    <div key={row} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", minHeight: 44, borderBottom: "1px solid var(--color-edge-2)" }}>
                      <div style={{ height: 12, width: 140, background: "var(--color-surface-muted)", borderRadius: 4 }} className="animate-pulse" />
                      <div style={{ height: 12, width: 60, background: "var(--color-surface-muted)", borderRadius: 4 }} className="animate-pulse" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, ui-sans-serif, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", margin: 0 }}>
          Global Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-3)", marginTop: 6 }}>
          Platform-wide configuration — changes take effect immediately. Lending rules live in{" "}
          <a href="/loan-product" style={{ color: "var(--color-brand)", textDecoration: "underline" }}>Loan Product Config</a>.
        </p>
      </div>

      {/* 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* App */}
          <SectionCard icon={<MonitorCog size={13} color="var(--color-brand)" />} color="var(--color-brand-soft)" title="App">
            {APP_TOGGLES.map(r => (
              <ToggleRow key={r.key} k={r.key} label={r.label} settings={settings} onToggle={handleToggle} toggling={toggling} isPending={saveMutation.isPending} />
            ))}
            {APP_TEXT.map(r => (
              <TextRow key={r.key} k={r.key} label={r.label} wide={r.wide} {...sharedTextProps} />
            ))}
          </SectionCard>

          {/* Employer Settlement */}
          <SectionCard icon={<Building2 size={13} color="#EF4444" />} color="var(--color-danger-bg)" title="Employer settlement">
            {SETTLEMENT_FIELDS.map(r => (
              <TextRow key={r.key} k={r.key} label={r.label} suffix={r.suffix} {...sharedTextProps} />
            ))}
          </SectionCard>

        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Notifications */}
          <SectionCard icon={<Bell size={13} color="var(--color-brand)" />} color="var(--color-brand-soft)" title="Notifications">
            {NOTIFICATION_TOGGLES.map(r => (
              <ToggleRow key={r.key} k={r.key} label={r.label} settings={settings} onToggle={handleToggle} toggling={toggling} isPending={saveMutation.isPending} />
            ))}
            {NOTIFICATION_FIELDS.map(r => (
              <TextRow key={r.key} k={r.key} label={r.label} suffix={r.suffix} {...sharedTextProps} />
            ))}
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
