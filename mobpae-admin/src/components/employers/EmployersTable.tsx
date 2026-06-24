import { useState } from "react";
import type { Employer, EmployerStatus, EmployerRiskStatus } from "../../types/employer";

interface Props {
  employers: Employer[];
  selectedId: string | null;
  onSelect: (employer: Employer) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A: "#EF4444", B: "#EC4899", C: "#A855F7", D: "#6C4CFF",
  E: "#6366F1", F: "#3B82F6", G: "#0EA5E9", H: "#06B6D4",
  I: "#10B981", J: "#22C55E", K: "#84CC16", L: "#EAB308",
  M: "#F59E0B", N: "#F97316", O: "#EF4444", P: "#6C4CFF",
  Q: "#8B5CF6", R: "#D946EF", S: "#EC4899", T: "#F43F5E",
  U: "#6C4CFF", V: "#6366F1", W: "#3B82F6", X: "#0EA5E9",
  Y: "#14B8A6", Z: "#10B981",
};
const avatarColor = (n: string) => AVATAR_COLORS[n.charAt(0).toUpperCase()] ?? "#6C4CFF";

const STATUS_CFG: Record<EmployerStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#16A34A", bg: "#DCFCE7" },
  PENDING:   { label: "Pending",   color: "#D97706", bg: "#FEF3C7" },
  APPROVED:  { label: "Approved",  color: "#16A34A", bg: "#DCFCE7" },
  REJECTED:  { label: "Rejected",  color: "#EF4444", bg: "#FEE2E2" },
  INACTIVE:  { label: "Inactive",  color: "#6B7280", bg: "#F3F4F6" },
  SUSPENDED: { label: "Suspended", color: "#D97706", bg: "#FEF3C7" },
};

const RISK_CFG: Record<EmployerRiskStatus, { label: string; color: string; bg: string }> = {
  GOOD:    { label: "Good",    color: "#16A34A", bg: "#DCFCE7" },
  WARNING: { label: "Warning", color: "#D97706", bg: "#FEF3C7" },
  BLOCKED: { label: "Blocked", color: "#EF4444", bg: "#FEE2E2" },
};

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const HEADERS = ["Company", "Contact", "Payroll", "Status", "Risk", ""];

export default function EmployersTable({ employers, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(17,24,39,0.04)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            {HEADERS.map((h, i) => (
              <th key={i} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employers.map((emp) => {
            const isSelected = selectedId === emp.id;
            const s = STATUS_CFG[emp.status] ?? { label: emp.status, color: "#6B7280", bg: "#F3F4F6" };
            const r = RISK_CFG[emp.riskStatus] ?? { label: emp.riskStatus, color: "#6B7280", bg: "#F3F4F6" };
            const ac = avatarColor(emp.companyName);
            const rowBg = isSelected ? "#F3F0FF" : hovered === emp.id ? "#FAFAFC" : "transparent";

            return (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                onMouseEnter={() => setHovered(emp.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Company */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ac, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {emp.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", margin: 0 }}>{emp.companyName}</p>
                      <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.companyCode}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "#374151", margin: 0 }}>{emp.contactPerson}</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>{emp.phone}</p>
                </td>

                {/* Payroll */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", margin: 0 }}>{emp.payrollDate}th</p>
                  <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0" }}>cutoff {emp.payrollCutoffDate}th</p>
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
                    style={{ height: 30, padding: "0 14px", background: isSelected ? "#6C4CFF" : "#F3F0FF", color: isSelected ? "white" : "#6C4CFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isSelected ? "Close" : "Manage"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
          {employers.length} {employers.length === 1 ? "employer" : "employers"}
        </p>
      </div>
    </div>
  );
}
