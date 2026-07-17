import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus, CheckCircle2, Clock, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  getActiveConfig, getConfigHistory, publishConfigVersion, deleteConfigVersion,
  type LoanProductConfig, type EligibilityRules, type PricingRules, type OperationalRules,
  type CreateConfigPayload,
} from "../services/loanProductService";
import { ConfirmModal } from "../components/ui/ConfirmModal";

// ── constants ─────────────────────────────────────────────────────────────────

const P   = "var(--color-brand)";
const T1  = "var(--color-ink)";
const T2  = "var(--color-ink-3)";
const T3  = "var(--color-ink-4)";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number | boolean | string, suffix = "") {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return `${v}${suffix}`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── rule display cards ────────────────────────────────────────────────────────

function RuleCard({ title, rows }: { title: string; rows: { label: string; value: string | number | boolean }[] }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--color-edge)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 11.5, fontWeight: 600, color: T2, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{title}</p>
      </div>
      <div>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid var(--color-canvas)" }}>
            <span style={{ fontSize: 12.5, color: T2 }}>{label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T1 }}>
              {typeof value === "boolean"
                ? <span style={{ color: value ? "var(--color-success)" : "var(--color-danger)" }}>{value ? "Yes" : "No"}</span>
                : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── publish drawer ────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function defaultForm(cfg: LoanProductConfig | undefined): CreateConfigPayload {
  if (!cfg) {
    return {
      versionName: "",
      effectiveFrom: today(),
      eligibilityRules: {
        platformAdvancePercentage: 10, platformMaxAdvanceAmount: 5000, hardCeilingPercentage: 50,
        minimumAdvanceAmount: 1000, minimumSalaryInHand: 10000, minimumTenureMonths: 3,
        requiresKyc: true, requiresMembership: true,
        requiresBankAccount: true,
        maxRequestsPerCycle: 1, cooldownDays: 0,
      },
      pricingRules: { annualInterestRate: 36, processingFeeRate: 0, gstRate: 0 },
      operationalRules: { requiresEmployerApproval: true, requiresAdminApproval: true, minDisbursalDays: 0, maxDisbursalDays: 3, defaultFundingSource: "MOBPAE" },
    };
  }
  return {
    versionName: "",
    effectiveFrom: today(),
    eligibilityRules: { ...cfg.eligibilityRules },
    pricingRules: { ...cfg.pricingRules },
    operationalRules: { ...cfg.operationalRules },
  };
}

interface Field { key: string; label: string; type: "number" | "bool" | "select"; suffix?: string; options?: string[] }

const ELIG_FIELDS: Field[] = [
  { key: "platformAdvancePercentage", label: "Platform cap %",         type: "number", suffix: "%" },
  { key: "platformMaxAdvanceAmount",  label: "Platform cap max (₹)",   type: "number", suffix: "₹" },
  { key: "hardCeilingPercentage",     label: "Hard ceiling %",         type: "number", suffix: "%" },
  { key: "minimumAdvanceAmount",      label: "Min advance amount",     type: "number", suffix: "₹" },
  { key: "minimumSalaryInHand",       label: "Min salary in-hand",    type: "number", suffix: "₹" },
  { key: "minimumTenureMonths",       label: "Min tenure",             type: "number", suffix: "mo" },
  { key: "maxRequestsPerCycle",       label: "Max requests/cycle",     type: "number" },
  { key: "cooldownDays",              label: "Cooldown days",          type: "number", suffix: "d" },
  { key: "requiresKyc",              label: "Requires KYC",           type: "bool" },
  { key: "requiresMembership",       label: "Requires membership",    type: "bool" },
  { key: "requiresBankAccount",      label: "Requires bank account",  type: "bool" },
];

const PRICING_FIELDS: Field[] = [
  { key: "annualInterestRate",       label: "Annual interest rate",   type: "number", suffix: "%" },
  { key: "processingFeeRate",        label: "Processing fee rate",    type: "number" },
  { key: "gstRate",                  label: "GST rate",               type: "number" },
];

const OPS_FIELDS: Field[] = [
  { key: "requiresEmployerApproval", label: "Requires employer approval", type: "bool" },
  { key: "requiresAdminApproval",    label: "Requires admin approval",    type: "bool" },
  { key: "minDisbursalDays",         label: "Min disbursal days",         type: "number", suffix: "d" },
  { key: "maxDisbursalDays",         label: "Max disbursal days",         type: "number", suffix: "d" },
  { key: "defaultFundingSource",     label: "Funding source",             type: "select", options: ["MOBPAE","EMPLOYER","PARTNER"] },
];

// ── NumberInput: local string state so intermediate typing works ──────────────

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  // Sync external resets (e.g. form reset) only when not focused
  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setText(String(value));
    }
  }, [value]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => {
        const n = parseFloat(text);
        const safe = isNaN(n) ? 0 : n;
        setText(String(safe));
        onChange(safe);
      }}
      style={{ width: 80, height: 28, padding: "0 8px", fontSize: 12, fontWeight: 500, color: T1, border: "1px solid var(--color-edge)", borderRadius: 8, outline: "none", textAlign: "right", fontFamily: "inherit" }}
    />
  );
}

// ── renderField + FieldGroup at module level (avoids remount on every render) ─

function renderField(field: Field, value: number | boolean | string, onChange: (v: number | boolean | string) => void) {
  if (field.type === "bool") {
    const on = Boolean(value);
    return (
      <button
        type="button"
        onClick={() => onChange(!on)}
        style={{ position: "relative", display: "inline-flex", alignItems: "center", height: 20, width: 36, borderRadius: 999, background: on ? P : "var(--color-edge)", border: "none", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
      >
        <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transform: on ? "translateX(18px)" : "translateX(3px)", transition: "transform 0.2s" }} />
      </button>
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={String(value)}
        onChange={e => onChange(e.target.value)}
        style={{ height: 28, padding: "0 8px", fontSize: 12, border: "1px solid var(--color-edge)", borderRadius: 8, background: "white", color: T1, fontFamily: "inherit", outline: "none" }}
      >
        {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {field.suffix === "₹" && <span style={{ fontSize: 11, color: T3 }}>₹</span>}
      <NumberInput value={Number(value)} onChange={v => onChange(v)} />
      {field.suffix && field.suffix !== "₹" && <span style={{ fontSize: 11, color: T3 }}>{field.suffix}</span>}
    </div>
  );
}

function FieldGroup({ title, fields, values, onSet }: {
  title: string;
  fields: Field[];
  values: Record<string, number | boolean | string>;
  onSet: (k: string, v: number | boolean | string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{title}</p>
      <div style={{ border: "1px solid var(--color-edge)", borderRadius: 12, overflow: "hidden" }}>
        {fields.map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--color-edge-2)" }}>
            <span style={{ fontSize: 12.5, color: T2 }}>{f.label}</span>
            {renderField(f, values[f.key] as number | boolean | string, v => onSet(f.key, v))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PublishDrawer ─────────────────────────────────────────────────────────────

interface DrawerProps {
  activeConfig: LoanProductConfig | undefined;
  onClose: () => void;
  onPublished: () => void;
}

function PublishDrawer({ activeConfig, onClose, onPublished }: DrawerProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateConfigPayload>(() => defaultForm(activeConfig));
  const [confirm, setConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: (p: CreateConfigPayload) => publishConfigVersion("SA", p),
    onSuccess: () => {
      toast.success("New config version published", { description: "All new applications will use these rules." });
      qc.invalidateQueries({ queryKey: ["loan-product-config"] });
      onPublished();
      onClose();
    },
    onError: (e: unknown) => {
      toast.error("Publish failed", { description: e instanceof Error ? e.message : "Unexpected error" });
    },
  });

  function setElig<K extends keyof EligibilityRules>(k: K, v: EligibilityRules[K]) {
    setForm(f => ({ ...f, eligibilityRules: { ...f.eligibilityRules, [k]: v } }));
  }
  function setPricing<K extends keyof PricingRules>(k: K, v: PricingRules[K]) {
    setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, [k]: v } }));
  }
  function setOps<K extends keyof OperationalRules>(k: K, v: OperationalRules[K]) {
    setForm(f => ({ ...f, operationalRules: { ...f.operationalRules, [k]: v } }));
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      {/* Backdrop */}
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />

      {/* Panel */}
      <div style={{ width: 480, background: "white", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-edge)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T1, margin: 0 }}>Publish New Config Version</p>
            <p style={{ fontSize: 11.5, color: T3, marginTop: 2 }}>
              {activeConfig ? `Supersedes v${activeConfig.versionNumber} · ${activeConfig.versionName ?? ""}` : "First version"}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "var(--color-surface-muted)", color: T2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* Meta */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Version info</p>
            <div style={{ border: "1px solid var(--color-edge)", borderRadius: 12, overflow: "hidden" }}>
              {[
                { label: "Version label", node: (
                  <input type="text" value={form.versionName ?? ""} onChange={e => setForm(f => ({ ...f, versionName: e.target.value }))} placeholder="e.g. Q3 2026 v2" style={{ width: 180, height: 28, padding: "0 8px", fontSize: 12, border: "1px solid var(--color-edge)", borderRadius: 8, outline: "none", fontFamily: "inherit" }} />
                )},
                { label: "Effective from", node: (
                  <input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} style={{ height: 28, padding: "0 8px", fontSize: 12, border: "1px solid var(--color-edge)", borderRadius: 8, outline: "none", fontFamily: "inherit" }} />
                )},
              ].map(({ label, node }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--color-edge-2)" }}>
                  <span style={{ fontSize: 12.5, color: T2 }}>{label}</span>
                  {node}
                </div>
              ))}
            </div>
          </div>

          <FieldGroup
            title="Eligibility rules"
            fields={ELIG_FIELDS}
            values={form.eligibilityRules as unknown as Record<string, number | boolean | string>}
            onSet={(k, v) => setElig(k as keyof EligibilityRules, v as never)}
          />
          <FieldGroup
            title="Pricing rules"
            fields={PRICING_FIELDS}
            values={form.pricingRules as unknown as Record<string, number | boolean | string>}
            onSet={(k, v) => setPricing(k as keyof PricingRules, v as never)}
          />
          <FieldGroup
            title="Operational rules"
            fields={OPS_FIELDS}
            values={form.operationalRules as unknown as Record<string, number | boolean | string>}
            onSet={(k, v) => setOps(k as keyof OperationalRules, v as never)}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-edge)", flexShrink: 0 }}>
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              style={{ width: "100%", height: 40, borderRadius: 10, background: P, color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Review & Publish →
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "var(--color-warning-bg)", border: "1px solid #FCD34D", borderRadius: 8, padding: "8px 12px" }}>
                <p style={{ fontSize: 12, color: "#92400E", margin: 0 }}>
                  ⚠ This will immediately deactivate the current config. All future loan applications will use the new rules.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setConfirm(false)}
                  style={{ flex: 1, height: 38, borderRadius: 10, background: "white", color: T2, border: "1px solid var(--color-edge)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => mutation.mutate(form)}
                  disabled={mutation.isPending}
                  style={{ flex: 2, height: 38, borderRadius: 10, background: "var(--color-danger)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: mutation.isPending ? 0.6 : 1 }}
                >
                  {mutation.isPending ? "Publishing…" : "Confirm & Publish"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── version history ───────────────────────────────────────────────────────────

function HistoryRow({ cfg, onDeleted }: { cfg: LoanProductConfig; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteConfigVersion("SA", cfg.id),
    onSuccess: () => {
      toast.success(`v${cfg.versionNumber} deleted`);
      onDeleted();
    },
    onError: (e: unknown) => {
      toast.error("Delete failed", { description: e instanceof Error ? e.message : "Unexpected error" });
      setConfirmDelete(false);
    },
  });

  return (
    <div style={{ border: "1px solid var(--color-edge)", borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", background: "white" }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {cfg.isActive
              ? <CheckCircle2 size={14} color="var(--color-success)" />
              : <Clock size={14} color={T3} />
            }
            <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>
              v{cfg.versionNumber}{cfg.versionName ? ` · ${cfg.versionName}` : ""}
            </span>
            {cfg.isActive && (
              <span style={{ fontSize: 10, fontWeight: 700, background: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: 99, padding: "1px 7px" }}>ACTIVE</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: T3 }}>{fmtDate(cfg.effectiveFrom)}</span>
            {open ? <ChevronUp size={13} color={T3} /> : <ChevronDown size={13} color={T3} />}
          </div>
        </button>
        {!cfg.isActive && (
          <div style={{ paddingRight: 12, flexShrink: 0 }}>
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
              title="Delete this version"
              style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, border: "1px solid var(--color-danger-bg)", background: "var(--color-danger-soft)", cursor: "pointer" }}
            >
              <Trash2 size={13} color="var(--color-danger)" />
            </button>
          </div>
        )}
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--color-edge-2)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { title: "Eligibility", rows: ELIG_FIELDS.map(f => ({ label: f.label, value: fmt((cfg.eligibilityRules as unknown as Record<string, number | boolean>)[f.key], f.suffix ?? "") })) },
            { title: "Pricing",     rows: PRICING_FIELDS.map(f => ({ label: f.label, value: fmt((cfg.pricingRules as unknown as Record<string, number | boolean>)[f.key], f.suffix ?? "") })) },
            { title: "Operational", rows: OPS_FIELDS.map(f => ({ label: f.label, value: fmt((cfg.operationalRules as unknown as Record<string, number | boolean | string>)[f.key] as number | boolean | string, f.suffix ?? "") })) },
          ].map(({ title, rows }) => (
            <div key={title} style={{ marginTop: 10 }}>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: T3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{title}</p>
              {rows.map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-canvas)" }}>
                  <span style={{ fontSize: 11.5, color: T2 }}>{label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: T1 }}>{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmDelete}
        title="Delete this version?"
        description={`This will permanently delete v${cfg.versionNumber}${cfg.versionName ? ` — ${cfg.versionName}` : ""}. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export function LoanProductPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const qc = useQueryClient();

  const { data: activeConfig, isLoading: loadingActive, isError: activeError, refetch: refetchActive } = useQuery<LoanProductConfig>({
    queryKey: ["loan-product-config", "SA", "active"],
    queryFn: () => getActiveConfig("SA"),
  });

  const { data: history = [], isLoading: loadingHistory, isError: historyError, refetch: refetchHistory } = useQuery<LoanProductConfig[]>({
    queryKey: ["loan-product-config", "SA", "history"],
    queryFn: () => getConfigHistory("SA"),
  });

  if (loadingActive) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <p style={{ fontSize: 13, color: T3 }}>Loading config…</p>
      </div>
    );
  }

  if (activeError) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
          <span>Failed to load the active loan product config.</span>
          <button onClick={() => void refetchActive()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      </div>
    );
  }

  const el = activeConfig?.eligibilityRules;
  const pr = activeConfig?.pricingRules;
  const or = activeConfig?.operationalRules;

  return (
    <>
      <div style={{ padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: T1, letterSpacing: "-0.025em", margin: 0 }}>Loan Product Config</h1>
            <p style={{ fontSize: 14, color: T2, marginTop: 6 }}>
              Salary Advance (SA) · Active version:&nbsp;
              {activeConfig
                ? <strong style={{ color: T1 }}>v{activeConfig.versionNumber}{activeConfig.versionName ? ` — ${activeConfig.versionName}` : ""}</strong>
                : "—"
              }
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", borderRadius: 10, background: P, color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
          >
            <Plus size={14} />
            Publish new version
          </button>
        </div>

        {/* Active config cards */}
        {activeConfig && el && pr && or ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
            <RuleCard
              title="Eligibility rules"
              rows={[
                { label: "Platform cap %",        value: fmt(el.platformAdvancePercentage ?? 0, "%") },
                { label: "Platform cap max",      value: `₹${(el.platformMaxAdvanceAmount ?? 0).toLocaleString("en-IN")}` },
                { label: "Hard ceiling %",        value: fmt(el.hardCeilingPercentage ?? 0, "%") },
                { label: "Min advance amount",    value: `₹${(el.minimumAdvanceAmount ?? 0).toLocaleString("en-IN")}` },
                { label: "Min salary in-hand",    value: `₹${(el.minimumSalaryInHand ?? 0).toLocaleString("en-IN")}` },
                { label: "Min tenure",            value: fmt(el.minimumTenureMonths, " mo") },
                { label: "Max requests/cycle",    value: el.maxRequestsPerCycle },
                { label: "Cooldown days",         value: fmt(el.cooldownDays, " d") },
                { label: "Requires KYC",          value: el.requiresKyc },
                { label: "Requires membership",   value: el.requiresMembership },
                { label: "Requires bank account", value: el.requiresBankAccount },
              ]}
            />
            <RuleCard
              title="Pricing rules"
              rows={[
                { label: "Annual interest rate",  value: fmt(pr.annualInterestRate, "% p.a.") },
                { label: "Processing fee rate",   value: pr.processingFeeRate === 0 ? "None" : fmt(pr.processingFeeRate) },
                { label: "GST rate",              value: pr.gstRate === 0 ? "None" : fmt(pr.gstRate) },
              ]}
            />
            <RuleCard
              title="Operational rules"
              rows={[
                { label: "Employer approval",    value: or.requiresEmployerApproval },
                { label: "Admin approval",       value: or.requiresAdminApproval },
                { label: "Min disbursal days",   value: fmt(or.minDisbursalDays, " d") },
                { label: "Max disbursal days",   value: fmt(or.maxDisbursalDays, " d") },
                { label: "Funding source",       value: or.defaultFundingSource },
              ]}
            />
          </div>
        ) : (
          <div style={{ background: "var(--color-warning-bg)", border: "1px solid #FCD34D", borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: "#92400E", margin: 0 }}>No active config found. Publish the first version to enable salary advances.</p>
          </div>
        )}

        {/* Version history */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 12 }}>Version history</p>
          {loadingHistory
            ? <p style={{ fontSize: 13, color: T3 }}>Loading…</p>
            : historyError
              ? (
                <div style={{ background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--color-danger)" }}>
                  <span>Failed to load version history.</span>
                  <button onClick={() => void refetchHistory()} style={{ padding: "6px 12px", background: "white", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--color-danger)", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
                </div>
              )
              : history.length === 0
                ? <p style={{ fontSize: 13, color: T3 }}>No versions yet.</p>
                : history.map(cfg => <HistoryRow key={cfg.id} cfg={cfg} onDeleted={() => qc.invalidateQueries({ queryKey: ["loan-product-config"] })} />)
          }
        </div>
      </div>

      {drawerOpen && (
        <PublishDrawer
          activeConfig={activeConfig}
          onClose={() => setDrawerOpen(false)}
          onPublished={() => qc.invalidateQueries({ queryKey: ["loan-product-config"] })}
        />
      )}
    </>
  );
}

export default LoanProductPage;
