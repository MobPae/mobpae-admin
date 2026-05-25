import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { saveToken } from "../services/auth";

export function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", form);

      const token =
        response.data?.accessToken ||
        response.data?.token ||
        response.data?.data?.accessToken ||
        response.data?.data?.token;

      if (!token) {
        setError("Login successful, but token was not found in response");
        return;
      }

      saveToken(token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-soft md:grid-cols-2">
          <section className="hidden bg-slate-950 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-2xl font-bold">
                Mob<span className="text-blue-400">Pae</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">Admin Console</p>
            </div>

            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
                <ShieldCheck size={30} />
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Manage salary advance operations with confidence.
              </h1>
              <p className="mt-5 leading-7 text-slate-400">
                Track employers, employees, requests, disbursals, repayments,
                and enquiries from one secure dashboard.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-400">
              <p>✓ Employer and employee management</p>
              <p>✓ Salary advance request tracking</p>
              <p>✓ Disbursal and repayment visibility</p>
            </div>
          </section>

          <section className="bg-white p-8 text-dark md:p-12">
            <div className="mb-10 md:hidden">
              <p className="text-2xl font-bold">
                Mob<span className="text-primary">Pae</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">Admin Console</p>
            </div>

            <div>
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <LockKeyhole size={24} />
              </div>

              <h2 className="text-3xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to MobPae Admin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  type="email"
                  placeholder="admin@mobpae.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  type="password"
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} MOBPAE SERVICES PRIVATE LIMITED
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
