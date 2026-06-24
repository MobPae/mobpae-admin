import { useState } from "react";
import type { Disbursal } from "../../types/disbursal";

interface Props {
  disbursals: Disbursal[];
  selectedId: string | null;
  onSelect: (d: Disbursal) => void;
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

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#D97706", bg: "#FEF3C7" },
  DISBURSED: { label: "Disbursed", color: "#16A34A", bg: "#DCFCE7" },
  FAILED:    { label: "Failed",    color: "#EF4444", bg: "#FEE2E2" },
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
          {disbursals.map(d => {
            const emp = d.salaryRequest.employee;
            const isSelected = selectedId === d.id;
            const s = STATUS_CFG[d.status] ?? { label: d.status, color: "#6B7280", bg: "#F3F4F6" };
            const ac = avatarColor(emp.name);
            const rowBg = isSelected ? "#F3F0FF" : hovered === d.id ? "#FAFAFC" : "transparent";

            return (
              <tr
                key={d.id}
                onClick={() => onSelect(d)}
                onMouseEnter={() => setHovered(d.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Employee */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ac, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", margin: 0 }}>{emp.name}</p>
                      <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.employeeCode}</p>
                    </div>
                  </div>
                </td>

                {/* Employer */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "#374151", margin: 0 }}>{emp.employer.companyName}</p>
                  <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>{emp.employer.companyCode}</p>
                </td>

                {/* Amount */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(d.amount)}</p>
                </td>

                {/* Status */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <Pill {...s} />
                </td>

                {/* Disbursed On */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, fontWeight: 500 }}>
                    {d.disbursedAt
                      ? new Date(d.disbursedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </td>

                {/* Action */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle", textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(d); }}
                    style={{ height: 30, padding: "0 14px", background: isSelected ? "#6C4CFF" : "#F3F0FF", color: isSelected ? "white" : "#6C4CFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isSelected ? "Close" : "View"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
          {disbursals.length} {disbursals.length === 1 ? "disbursal" : "disbursals"}
        </p>
      </div>
    </div>
  );
}
