import { useState } from "react";
import LoginFeature from "../components/auth/LoginFeature";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex bg-slate-100">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#081028] to-[#1D4ED8]">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%)]" />

        <div className="relative z-10 flex flex-col justify-center w-full px-12 py-10">
          {/* Logo */}
          <div>
            <div className="mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-black tracking-tight">
                    MP
                  </span>
                </div>

                <div>
                  <h1 className="text-white text-3xl font-bold">MobPae</h1>

                  <p className="text-blue-200 text-sm tracking-wider">
                    ADMIN PORTAL
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              Financial Wellness Platform
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight text-white">
              Because Financial Emergencies Don't Wait for Payday
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-300 max-w-lg">
              Streamline employer onboarding, employee management, salary
              advances, repayments and payroll integrations through one secure
              platform.
            </p>

            <div className="mt-10 space-y-4 max-w-lg">
              <LoginFeature
                title="Instant Salary Access"
                description="Employees access earned salary before payday."
              />

              <LoginFeature
                title="Payroll Integrated"
                description="Built for employers with seamless payroll workflows."
              />

              <LoginFeature
                title="Secure & Compliant"
                description="Enterprise-grade security and audit trails."
              />
            </div>
          </div>

          {/* Preview */}
          {/* <div className="mt-6 max-w-sm">
            <LoginPreviewCard />
          </div> */}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-8">
        <div className="w-full max-w-[660px]">
          <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[36px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                M
              </div>

              <div>
                <h2 className="font-bold text-slate-900">MobPae</h2>

                <p className="text-xs text-slate-500">ADMIN PORTAL</p>
              </div>
            </div>

            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
              MOBPAE ADMIN
            </p>
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome Back 👋
            </h1>

            <p className="mt-3 text-slate-500 text-base">
              Sign in to continue to MobPae Admin Portal.
            </p>

            <form className="mt-10 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="admin@mobpae.com"
                  className="
                    w-full
                    h-14
                    px-5
                    bg-slate-50
                    text-base
                    rounded-2xl
                    border
                    border-slate-200
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    outline-none
                    transition-all
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="
                      w-full
                      h-14
                      px-5
                      bg-slate-50
                      text-base
                      rounded-2xl
                      border
                      border-slate-200
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                      outline-none
                      transition-all
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" />
                  Remember Me
                </label>

                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  to-blue-700
                  text-white
                  text-base
                  font-semibold
                  shadow-lg
                  shadow-blue-500/25
                  hover:scale-[1.01]
                  transition-all
                "
              >
                Sign In
              </button>

              <div className="flex justify-center gap-3 mt-4 text-xs text-slate-500">
                <span>Secure Authentication</span>
                <span>•</span>
                <span>Role-Based Access</span>
                <span>•</span>
                <span>Audit Logs Enabled</span>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Protected by MobPae Security</span>

                <span>Version 1.0 • © 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
