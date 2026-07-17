import { useState } from "react";
import type { Disbursal } from "../../types/disbursal";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  disbursals: Disbursal[];
  selectedId: string | null;
  onSelect: (d: Disbursal) => void;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  PROCESSING: { label: "Processing", color: "var(--color-info)", bg: "var(--color-info-bg)" },
  SUCCESS:    { label: "Succeeded",  color: "var(--color-success)", bg: "var(--color-success-bg)" },
  FAILED:     { label: "Failed",     color: "#EF4444", bg: "var(--color-danger-bg)" },
  CANCELLED:  { label: "Cancelled",  color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" },
};

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const fmt = (v: string) => `₹${Number(v).toLocaleString("en-IN")}`;
const HEADERS = ["Employee", "Employer", "Amount", "Status", "Disbursed On", ""];

export default function DisbursalsTable({ disbursals, selectedId, onSelect }: Props) {
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
          {disbursals.map(d => {
            const emp = d.loanApplication.employee;
            const isSelected = selectedId === d.id;
            const s = STATUS_CFG[d.status] ?? { label: d.status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
            const ac = avatarColor(emp.name);
            const rowBg = isSelected ? "var(--color-brand-soft)" : hovered === d.id ? "var(--color-surface-raised)" : "transparent";

            return (
              <tr
                key={d.id}
                onClick={() => onSelect(d)}
                onMouseEnter={() => setHovered(d.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid var(--color-canvas)", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Employee */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ac, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{emp.name}</p>
                      <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.employeeCode}</p>
                    </div>
                  </div>
                </td>

                {/* Employer */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>{emp.employer.companyName}</p>
                  <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.employer.companyCode}</p>
                </td>

                {/* Amount */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-ink)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(d.disbursedAmount)}</p>
                </td>

                {/* Status */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <Pill {...s} />
                </td>

                {/* Completed On */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-4)", margin: 0, fontWeight: 500 }}>
                    {d.completedAt
                      ? new Date(d.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </td>

                {/* Action */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle", textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(d); }}
                    style={{ height: 30, padding: "0 14px", background: isSelected ? "var(--color-brand)" : "var(--color-brand-soft)", color: isSelected ? "white" : "var(--color-brand)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isSelected ? "Close" : "View"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-edge-2)", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: 0 }}>
          {disbursals.length} {disbursals.length === 1 ? "disbursal" : "disbursals"}
        </p>
      </div>
    </div>
  );
}
