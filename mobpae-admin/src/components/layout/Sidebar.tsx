import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  UserCircle2,
  Users,
  FileCheck,
  Landmark,
  Wallet,
  ArrowDownCircle,
  RefreshCcw,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

interface Section {
  title: string;
  items: NavItem[];
}

const SECTIONS: Section[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" }],
  },
  {
    title: "Operations",
    items: [
      { label: "Employer onboarding", icon: Building2, to: "/employer-enquiries" },
      { label: "Employers", icon: UserCircle2, to: "/employers" },
      { label: "Employees", icon: Users, to: "/employees" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Salary requests", icon: Wallet, to: "/salary-requests" },
      { label: "Disbursals", icon: ArrowDownCircle, to: "/disbursals" },
      { label: "Repayments", icon: RefreshCcw, to: "/repayments" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "KYC verification", icon: FileCheck, to: "/kyc" },
      { label: "Bank verification", icon: Landmark, to: "/bank-verification" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", icon: Settings, to: "/settings" }],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[210px] h-screen bg-[#0c1322] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-11 flex items-center px-4 border-b border-white/[0.06] gap-2.5">
        <div className="w-[22px] h-[22px] rounded-[5px] bg-blue-500 flex items-center justify-center text-white text-[10px] font-[600]">
          M
        </div>
        <span className="text-[13px] font-[500] text-white tracking-tight">MobPae</span>
        <span className="text-[10px] text-slate-500 mt-px">admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-500 px-2 mb-1">
              {section.title}
            </p>
            <div className="space-y-px">
              {section.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[12px] transition-colors ${
                      isActive
                        ? "bg-white/[0.09] text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={14}
                        className={isActive ? "text-white" : "text-slate-500"}
                      />
                      <span className="leading-none">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-[500]">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-[500] text-slate-300 leading-none truncate">
              Admin User
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
