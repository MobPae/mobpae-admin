import { Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getToken, setToken, setRefreshToken } from "../utils/auth";

const P  = "var(--color-brand)";
const PD = "var(--color-info)";

export default function LoginPage() {
  const [showPass, setShowPass]  = useState(false);
  const [email,    setEmail]     = useState("");
  const [password, setPassword]  = useState("");
  const [remember, setRemember]  = useState(false);
  const [loading,  setLoading]   = useState(false);
  const [error,    setError]     = useState(() => {
    if (sessionStorage.getItem("mobpae_session_expired")) {
      sessionStorage.removeItem("mobpae_session_expired");
      return "Your session has expired. Please sign in again.";
    }
    return "";
  });
  const navigate = useNavigate();

  useEffect(() => { if (getToken()) navigate("/"); }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError("");
      const res = await login(email.trim().toLowerCase(), password);
      setToken(res.accessToken);
      if (res.refreshToken) setRefreshToken(res.refreshToken);
      navigate(res.passwordChanged === false ? "/change-password" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT — Form panel ───────────────────────────────────── */}
      <div style={{
        width: "45%", flexShrink: 0,
        background: "white",
        display: "flex", flexDirection: "column",
        overflow: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 40px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo-icon.svg" alt="MobPae" width="44" height="28" style={{ objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em" }}>MobPae</span>
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px 40px" }}>
          <div style={{ maxWidth: 380, width: "100%" }}>

            {/* Heading */}
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.025em", lineHeight: 1.2, margin: "0 0 8px" }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-ink-3)", lineHeight: 1.6, marginBottom: 32 }}>
              Sign in to access your MobPae admin dashboard
            </p>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", marginBottom: 6 }}>
                  Email address
                </label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "white", border: "1.5px solid var(--color-edge)", borderRadius: 12, padding: "11px 14px",
                  transition: "border-color 0.15s",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-disabled)" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email" required autoComplete="email"
                    style={{ flex: 1, fontSize: 14, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", minWidth: 0, fontFamily: "inherit" }}
                    onFocus={e  => { (e.target.closest("div") as HTMLElement).style.borderColor = P; }}
                    onBlur={e   => { (e.target.closest("div") as HTMLElement).style.borderColor = "var(--color-edge)"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-ink-2)", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "white", border: "1.5px solid var(--color-edge)", borderRadius: 12, padding: "11px 14px",
                  transition: "border-color 0.15s",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-disabled)" strokeWidth="2" strokeLinecap="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required autoComplete="current-password"
                    style={{ flex: 1, fontSize: 14, color: "var(--color-ink)", background: "transparent", outline: "none", border: "none", minWidth: 0, fontFamily: "inherit" }}
                    onFocus={e  => { (e.target.closest("div") as HTMLElement).style.borderColor = P; }}
                    onBlur={e   => { (e.target.closest("div") as HTMLElement).style.borderColor = "var(--color-edge)"; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ color: "var(--color-ink-disabled)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--color-ink-3)" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{ accentColor: P, width: 15, height: 15, borderRadius: 4, cursor: "pointer" }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  style={{ fontSize: 13, color: P, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-danger-soft)", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--color-danger)", fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  width: "100%", height: 48, marginTop: 4,
                  background: loading ? "var(--color-brand-muted)" : `linear-gradient(135deg, ${PD} 0%, ${P} 100%)`,
                  color: "white", borderRadius: 12, border: "none",
                  fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(49,94,255,0.30)",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <>Sign in <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                )}
              </button>
            </form>

            {/* Trust note */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28, padding: "12px 16px", background: "var(--color-canvas)", borderRadius: 10 }}>
              <Shield size={14} style={{ color: "var(--color-ink-4)", flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "var(--color-ink-4)", lineHeight: 1.5 }}>
                Your data is protected with bank-grade encryption and security.
              </p>
            </div>

            <p style={{ marginTop: 20, fontSize: 12, color: "var(--color-ink-disabled)", textAlign: "center" }}>
              © {new Date().getFullYear()} MobPae Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Brand panel ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #8B7CFF 0%, var(--color-brand) 50%, var(--color-info) 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "48px 48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: 400, height: 400, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-8%",
          width: 320, height: 320, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>
            Smart. Secure. Simple.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.70)", lineHeight: 1.6, marginBottom: 40, maxWidth: 360, margin: "0 auto 40px" }}>
            All your employee advances, managed in one place.
          </p>

          {/* Trust badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999, padding: "10px 20px",
          }}>
            <ShieldCheck size={16} color="white" />
            <span style={{ fontSize: 13, fontWeight: 500, color: "white" }}>
              Bank-grade encryption, role-gated access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
