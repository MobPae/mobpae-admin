import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, ShieldCheck } from "lucide-react";
import { changePassword, logout } from "../services/authService";
import { getApiErrorMessage } from "../utils/api-errors";

const P  = "#315eff";
const PL = "#EEF2FF";

function getStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"];

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const strength = getStrength(next);

  const checks = [
    { label: "At least 8 characters",         ok: next.length >= 8 },
    { label: "Includes uppercase and lowercase", ok: /[A-Z]/.test(next) && /[a-z]/.test(next) },
    { label: "Includes a number",              ok: /\d/.test(next) },
    { label: "Includes a special character",   ok: /[^A-Za-z0-9]/.test(next) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (next !== confirm) { setError("New password and confirm password do not match."); return; }
    if (next.length < 8)  { setError("New password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      await changePassword(current, next);
      await logout();
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to change password.");
      setError(msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("wrong")
        ? "Current password is incorrect."
        : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FC",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "Inter, ui-sans-serif, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#6B7280", fontWeight: 500,
            background: "none", border: "none", cursor: "pointer",
            marginBottom: 28, padding: 0, fontFamily: "inherit",
          }}
        >
          <ArrowLeft size={15} />
          Back to login
        </button>

        <div style={{ background: "white", borderRadius: 24, padding: "40px 40px 36px", boxShadow: "0 2px 8px rgba(17,24,39,0.06), 0 0 0 1px #E5E7EB" }}>

          {/* Icon + heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: PL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Lock size={24} style={{ color: P }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>Change Password</h1>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 1.5 }}>
                For your security, please choose a strong password that you don't use on other sites.
              </p>
            </div>
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <ShieldCheck size={28} style={{ color: "#16A34A" }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Password changed successfully!</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <Field label="Current Password" value={current} onChange={setCurrent} show={showCur} onToggle={() => setShowCur(v => !v)} placeholder="Enter your current password" autoComplete="current-password" />

              {/* New password + strength */}
              <div>
                <Field label="New Password" value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext(v => !v)} placeholder="Enter your new password" autoComplete="new-password" />

                {next.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {/* Strength bar */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 999,
                          background: i <= strength ? STRENGTH_COLORS[strength] : "#E5E7EB",
                          transition: "background 0.2s",
                        }} />
                      ))}
                      <span style={{ fontSize: 11, fontWeight: 600, color: STRENGTH_COLORS[strength], minWidth: 42, textAlign: "right", lineHeight: "4px" }}>
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                    {/* Checks */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                      {checks.map((c) => (
                        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.ok ? "#16A34A" : "#9CA3AF" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {c.ok ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="9" />}
                          </svg>
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Field label="Confirm New Password" value={confirm} onChange={setConfirm} show={showCon} onToggle={() => setShowCon(v => !v)} placeholder="Confirm your new password" autoComplete="new-password" />

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !current || !next || !confirm}
                style={{
                  width: "100%", height: 48,
                  background: (loading || !current || !next || !confirm)
                    ? "#E5E7EB"
                    : `linear-gradient(135deg, #2048EE 0%, ${P} 100%)`,
                  color: (loading || !current || !next || !confirm) ? "#9CA3AF" : "white",
                  borderRadius: 12, border: "none",
                  fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: (loading || !current || !next || !confirm) ? "not-allowed" : "pointer",
                  boxShadow: (loading || !current || !next || !confirm) ? "none" : "0 4px 20px rgba(49,94,255,0.28)",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                  marginTop: 4,
                }}
              >
                {loading ? (
                  <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>Update Password <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                )}
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </button>

              {/* Security note */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shield size={14} style={{ color: P }} />
                </div>
                <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>
                  For your security, you will be signed out of all other active sessions.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, show, onToggle, placeholder, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  const P = "#315eff";
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "white", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "11px 14px",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
        onFocus={() => {}} // handled on input
      >
        <Lock size={14} style={{ color: "#D1D5DB", flexShrink: 0 }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          style={{ flex: 1, fontSize: 14, color: "#111827", background: "transparent", outline: "none", border: "none", minWidth: 0, fontFamily: "inherit" }}
          onFocus={e  => {
            const wrapper = e.target.closest("div") as HTMLElement;
            wrapper.style.borderColor = P;
            wrapper.style.boxShadow = "0 0 0 4px rgba(49,94,255,0.10)";
          }}
          onBlur={e   => {
            const wrapper = e.target.closest("div") as HTMLElement;
            wrapper.style.borderColor = "#E5E7EB";
            wrapper.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{ color: "#D1D5DB", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
