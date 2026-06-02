export default function Sidebar() {
  const menus = [
    "Dashboard",
    "Employer Enquiries",
    "Employers",
    "Employees",
    "KYC Verification",
    "Bank Verification",
    "Salary Limits",
    "Salary Requests",
    "Disbursals",
    "Repayments",
    "Notifications",
  ];

  return (
    <aside className="w-64 bg-[#081028] text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">MobPae</h1>
        <p className="text-sm text-slate-400">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu, index) => (
          <button
            key={menu}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
              index === 0 ? "bg-blue-600" : "hover:bg-slate-800"
            }`}
          >
            {menu}
          </button>
        ))}
      </nav>
    </aside>
  );
}
