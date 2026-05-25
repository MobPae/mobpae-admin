import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

export function LoginPage() {
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

            <form className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
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
                  type="password"
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Login <ArrowRight size={18} />
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
