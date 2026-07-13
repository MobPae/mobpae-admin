import { useState } from "react";
import type { EmployerEnquiry, EmployerEnquiryStatus } from "../../types/employer-enquiry";

interface Props {
  enquiries: EmployerEnquiry[];
  selectedId: string | null;
  onSelect: (enquiry: EmployerEnquiry) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A: "#EF4444", B: "#EC4899", C: "#A855F7", D: "var(--color-brand)",
  E: "#6366F1", F: "#3B82F6", G: "#0EA5E9", H: "#06B6D4",
  I: "#10B981", J: "#22C55E", K: "#84CC16", L: "#EAB308",
  M: "#F59E0B", N: "#F97316", O: "#EF4444", P: "var(--color-brand)",
  Q: "#8B5CF6", R: "#D946EF", S: "#EC4899", T: "#F43F5E",
  U: "var(--color-brand)", V: "#6366F1", W: "#3B82F6", X: "#0EA5E9",
  Y: "#14B8A6", Z: "#10B981",
};
const avatarColor = (n: string) => AVATAR_COLORS[n.charAt(0).toUpperCase()] ?? "var(--color-brand)";

const STATUS_CONFIG: Record<EmployerEnquiryStatus, { label: string; color: string; bg: string }> = {
  NEW:       { label: "New",       color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  CONTACTED: { label: "Contacted", color: "var(--color-info)", bg: "var(--color-info-bg)" },
  APPROVED:  { label: "Onboarded", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  ONBOARDED: { label: "Onboarded", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  REJECTED:  { label: "Rejected",  color: "#EF4444", bg: "var(--color-danger-bg)" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

const HEADERS = ["Company", "Contact", "Email", "Employees", "Status", "Received"];

export default function EmployerEnquiriesTable({ enquiries, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(17,24,39,0.04)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6", background: "var(--color-surface-raised)" }}>
            {HEADERS.map((h) => (
              <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--color-ink-4)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enq) => {
            const isSelected = selectedId === enq.id;
            const isHovered = hovered === enq.id;
            const s = STATUS_CONFIG[enq.status] ?? { label: enq.status, color: "var(--color-ink-3)", bg: "var(--color-surface-muted)" };
            const ac = avatarColor(enq.companyName);

            let rowBg = "transparent";
            if (isSelected) rowBg = "var(--color-brand-soft)";
            else if (isHovered) rowBg = "var(--color-surface-raised)";

            return (
              <tr
                key={enq.id}
                onClick={() => onSelect(enq)}
                onMouseEnter={() => setHovered(enq.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: rowBg, transition: "background 0.1s" }}
              >
                {/* Company */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: ac,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 14, fontWeight: 700, flexShrink: 0,
                    }}>
                      {enq.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                        {enq.companyName}
                      </p>
                      {enq.phone && (
                        <p style={{ fontSize: 11.5, color: "var(--color-ink-4)", margin: "2px 0 0", fontFamily: "ui-monospace, monospace" }}>
                          {enq.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-ink-2)", margin: 0 }}>{enq.contactPerson}</p>
                </td>

                {/* Email */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-3)", margin: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{enq.email}</p>
                </td>

                {/* Employees */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  {enq.employeeCount != null
                    ? <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>{enq.employeeCount.toLocaleString("en-IN")}</p>
                    : <p style={{ fontSize: 13, color: "var(--color-ink-disabled)", margin: 0 }}>—</p>
                  }
                </td>

                {/* Status */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    height: 24, padding: "0 10px", borderRadius: 999,
                    background: s.bg, color: s.color,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    {s.label}
                  </span>
                </td>

                {/* Received */}
                <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-4)", margin: 0, fontWeight: 500 }}>{timeAgo(enq.createdAt)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "var(--color-surface-raised)" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-4)", margin: 0 }}>
          {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}
        </p>
      </div>
    </div>
  );
}
