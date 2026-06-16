import { Eye, EyeOff, Lock, Mail, ShieldCheck, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getToken, setToken } from "../utils/auth";

const BRAND = "#c4522a";
const BRAND_DARK = "#a8411f";
const BRAND_LIGHT = "#fdf3ee";

const STATS = [
  { label: "Active employers", value: "24" },
  { label: "Employees enrolled", value: "1,280" },
  { label: "Advances disbursed", value: "₹48L" },
  { label: "Recovery rate", value: "99.2%" },
];

const FEATURES = [
  { icon: Users,       text: "Manage all employer accounts and employee records" },
  { icon: Zap,         text: "Approve salary advance requests in real-time"       },
  { icon: ShieldCheck, text: "Full audit trail, KYC verification and bank control"  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const navigate = useNavigate();

  useEffect(() => { if (getToken()) navigate("/"); }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await login(email, password);
      setToken(response.accessToken);
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* ── Left panel — terracotta ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[48%] flex-col flex-shrink-0 relative overflow-hidden"
        style={{ background: BRAND }}
      >
        {/* Architectural line-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Top-right accent glow */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-black/10 blur-[100px] pointer-events-none" />
        {/* Bottom-left accent */}
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-white/8 blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-10 py-10 justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-[700] text-[15px] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}
            >
              M
            </div>
            <div>
              <p className="text-[14px] font-[600] text-white leading-none">MobPae</p>
              <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-[0.14em]">Admin Console</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[11px] font-[500] text-white/80 uppercase tracking-[0.07em]"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Platform command centre
            </div>

            <h1 className="text-[34px] font-[700] text-white leading-[1.15] tracking-[-0.02em]">
              One place to run<br />
              earned wage access<br />
              <span style={{ color: "rgba(255,255,255,0.6)" }}>end-to-end.</span>
            </h1>

            <div className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <Icon size={12} color="white" />
                  </div>
                  <p className="text-[13px] text-white/70 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live stats card */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <p className="text-[10px] font-[600] text-white/40 uppercase tracking-[0.1em] mb-3">Platform overview</p>
            <div className="grid grid-cols-2 gap-3">
              {STATS.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[20px] font-[700] text-white leading-none tabular-nums">{value}</p>
                  <p className="text-[11px] text-white/40 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — white form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#fafafa]">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-[700] text-[15px]"
              style={{ background: BRAND }}
            >
              M
            </div>
            <p className="text-[14px] font-[600] text-slate-900">MobPae Admin</p>
          </div>

          {/* Eyebrow + heading */}
          <p
            className="text-[11px] font-[600] uppercase tracking-[0.1em] mb-2"
            style={{ color: BRAND }}
          >
            Secure admin access
          </p>
          <h2 className="text-[28px] font-[700] text-slate-900 tracking-[-0.02em] leading-tight">
            Sign in to<br />Admin Console
          </h2>
          <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
            Role-based access — admin credentials only.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-[500] text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mobpae.com"
                  required
                  className="w-full h-10 pl-9 pr-4 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 outline-none transition"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND_LIGHT}`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-[500] text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-10 pl-9 pr-10 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 outline-none transition"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND_LIGHT}`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <p className="text-[12px] text-red-600 font-[500]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-white text-[13px] font-[600] flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              style={{ background: loading ? BRAND_DARK : BRAND }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = BRAND_DARK; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = BRAND; }}
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                </svg>
              ) : "Sign in to Admin Console"}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[12px] font-[500] text-slate-800">Admin access only</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use credentials provisioned by MobPae.</p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Version 1.0 · © 2026 MobPae
          </p>
        </div>
      </div>
    </div>
  );
}
