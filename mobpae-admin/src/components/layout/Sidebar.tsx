import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  Landmark,
  Wallet,
  CreditCard,
  Bell,
} from "lucide-react";

export default function Sidebar() {
  const menus = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Employer Enquiries", icon: Building2 },
    { label: "Employers", icon: Building2 },
    { label: "Employees", icon: Users },
    { label: "KYC Verification", icon: FileCheck },
    { label: "Bank Verification", icon: Landmark },
    { label: "Salary Limits", icon: Wallet },
    { label: "Salary Requests", icon: CreditCard },
    { label: "Disbursals", icon: Wallet },
    { label: "Repayments", icon: CreditCard },
    { label: "Notifications", icon: Bell },
  ];

  return (
    <aside className="w-64 bg-[#081028] text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">MobPae</h1>
        <p className="text-sm text-slate-400">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu, index) => {
          const Icon = menu.icon;

          return (
            <button
              key={menu.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                index === 0 ? "bg-blue-600" : "hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />

              <span>{menu.label}</span>

              {menu.label === "Notifications" && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
