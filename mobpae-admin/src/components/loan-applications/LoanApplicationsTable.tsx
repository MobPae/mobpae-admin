import { useState } from "react";
import type { LoanApplication, LoanApplicationStatus } from "../../types/loan-application";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  applications: LoanApplication[];
  selectedId: string | null;
  onSelect: (a: LoanApplication) => void;
}

const STATUS_CFG: Record<LoanApplicationStatus, { label: string; color: string; bg: string }> = {
  SUBMITTED:                   { label: "Submitted",          color: "var(--color-warning)",        bg: "var(--color-warning-bg)"    },
  EMPLOYER_APPROVED:           { label: "Emp. Approved",      color: "var(--color-info)",            bg: "var(--color-info-bg)"       },
  EMPLOYER_REJECTED:           { label: "Rejected",           color: "#EF4444",                      bg: "var(--color-danger-bg)"     },
  AWAITING_MEMBERSHIP_PAYMENT: { label: "Platform Fee",       color: "var(--color-warning)",        bg: "var(--color-warning-bg)"    },
  AWAITING_PLATFORM_FEE_PAYMENT: { label: "Platform Fee",     color: "var(--color-warning)",        bg: "var(--color-warning-bg)"    },
  READY_FOR_DISBURSAL:         { label: "Ready",              color: "var(--color-success)",         bg: "var(--color-success-bg)"    },
  DISBURSED:                   { label: "Disbursed",          color: "var(--color-success)",         bg: "var(--color-success-bg)"    },
  REPAYMENT_SCHEDULED:         { label: "Repaying",           color: "var(--color-warning)",        bg: "var(--color-warning-bg)"    },
  REPAID:                      { label: "Repaid",             color: "var(--color-success)",         bg: "var(--color-success-bg)"    },
  CANCELLED:                   { label: "Cancelled",          color: "var(--color-ink-3)",           bg: "var(--color-surface-muted)" },
  EXPIRED:                     { label: "Expired",            color: "var(--color-ink-3)",           bg: "var(--color-surface-muted)" },
};

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function eligibilityInfo(app: LoanApplication) {
  const salary    = parseFloat(app.snapshotSalaryInHand)          || 0;
  const threshold = parseFloat(app.snapshotInterestFreeThreshold) || 0;
  const requested = parseFloat(app.requestedAmount)               || 0;
  const overAmount = Math.max(0, requested - threshold);
  return { salary, threshold, withinLimit: requested <= threshold, overAmount };
}

const fmt  = (v: string | null | undefined) => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
const fmtN = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const HEADERS = ["Employee", "Company", "Salary / Rule", "Requested", "Approved", "Status", "Submitted", ""];

export default function LoanApplicationsTable({ applications, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(17,24,39,0.04)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6", background: "var(--color-surface-raised)" }}>
            {HEADERS.map((h, i) => (
              <th key={i} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const isSelected = selectedId === app.id;
            const s  = STATUS_CFG[app.status] ?? { label: app.status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
            const ac = avatarColor(app.employee.name);
            const rowBg = isSelected ? "var(--color-brand-soft)" : hovered === app.id ? "var(--color-surface-raised)" : "transparent";
            const el = eligibilityInfo(app);

            return (
              <tr
                key={app.id}
                onClick={() => onSelect(app)}
                onMouseEnter={() => setHovered(app.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Employee */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ac, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {app.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{app.employee.name}</p>
                      <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{app.employee.employeeCode}</p>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>{app.employer?.companyName ?? "—"}</p>
                  <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{app.employer?.companyCode ?? "—"}</p>
                </td>

                {/* Salary / Rule */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  {el.salary > 0 ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                        {fmtN(el.salary)}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--color-ink-4)", margin: "2px 0 4px", fontVariantNumeric: "tabular-nums" }}>
                        limit {fmtN(el.threshold)} ({app.snapshotMaxAdvancePercentage}%)
                      </p>
                      {el.withinLimit ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--color-success)", background: "var(--color-success-bg)", borderRadius: 6, padding: "2px 7px" }}>
                          ✓ Free
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--color-warning)", background: "var(--color-warning-bg)", borderRadius: 6, padding: "2px 7px" }}>
                          ⚠ +{fmtN(el.overAmount)} interest
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--color-ink-4)" }}>—</span>
                  )}
                </td>

                {/* Requested */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-ink)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(app.requestedAmount)}</p>
                </td>

                {/* Approved */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: app.adminApprovedAmount ? "var(--color-ink)" : "var(--color-ink-disabled)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(app.adminApprovedAmount ?? app.employerApprovedAmount)}
                  </p>
                </td>

                {/* Status */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <Pill {...s} />
                </td>

                {/* Submitted */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-4)", margin: 0, fontWeight: 500 }}>
                    {new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </td>

                {/* Action */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle", textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(app); }}
                    style={{ height: 30, padding: "0 14px", background: isSelected ? "var(--color-brand)" : "var(--color-brand-soft)", color: isSelected ? "white" : "var(--color-brand)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isSelected ? "Close" : "Review"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: 0 }}>
          {applications.length} {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>
    </div>
  );
}
