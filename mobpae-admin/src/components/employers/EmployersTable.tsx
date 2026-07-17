import { useState } from "react";
import type { Employer, EmployerStatus, EmployerRiskStatus } from "../../types/employer";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  employers: Employer[];
  selectedId: string | null;
  onSelect: (employer: Employer) => void;
}

const STATUS_CFG: Record<EmployerStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
  PENDING:   { label: "Pending",   color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  APPROVED:  { label: "Approved",  color: "var(--color-success)", bg: "var(--color-success-bg)" },
  REJECTED:  { label: "Rejected",  color: "#EF4444", bg: "var(--color-danger-bg)" },
  INACTIVE:  { label: "Inactive",  color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
  SUSPENDED: { label: "Suspended", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
};

const RISK_CFG: Record<EmployerRiskStatus, { label: string; color: string; bg: string }> = {
  GOOD:    { label: "Good",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
  WARNING: { label: "Warning", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  BLOCKED: { label: "Blocked", color: "#EF4444", bg: "var(--color-danger-bg)" },
};

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const HEADERS = ["Company", "Contact", "Salary Cycle", "Status", "Risk", ""];

export default function EmployersTable({ employers, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--color-edge)", boxShadow: "0 2px 8px rgba(17,24,39,0.04)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
            {HEADERS.map((h, i) => (
              <th key={i} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employers.map((emp) => {
            const isSelected = selectedId === emp.id;
            const s = STATUS_CFG[emp.status] ?? { label: emp.status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
            const r = RISK_CFG[emp.riskStatus] ?? { label: emp.riskStatus, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
            const ac = avatarColor(emp.companyName);
            const rowBg = isSelected ? "var(--color-brand-soft)" : hovered === emp.id ? "var(--color-surface-raised)" : "transparent";

            return (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                onMouseEnter={() => setHovered(emp.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid var(--color-canvas)", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Company */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ac, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {emp.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{emp.companyName}</p>
                      <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.companyCode}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>{emp.contactPerson}</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: "2px 0 0" }}>{emp.phone}</p>
                </td>

                {/* Salary cycle */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{emp.payrollDate}th</p>
                  <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0" }}>cutoff {emp.payrollCutoffDate}th</p>
                </td>

                {/* Status */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <Pill {...s} />
                </td>

                {/* Risk */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <Pill {...r} />
                </td>

                {/* Action */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle", textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(emp); }}
                    style={{ height: 30, padding: "0 14px", background: isSelected ? "var(--color-brand)" : "var(--color-brand-soft)", color: isSelected ? "white" : "var(--color-brand)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isSelected ? "Close" : "Manage"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: 0 }}>
          {employers.length} {employers.length === 1 ? "employer" : "employers"}
        </p>
      </div>
    </div>
  );
}
