export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, Admin 👋
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Here's what's happening in MobPae today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-300" />

        <div>
          <p className="font-semibold">Admin User</p>
          <p className="text-sm text-slate-500">Super Admin</p>
        </div>
      </div>
    </header>
  );
}
