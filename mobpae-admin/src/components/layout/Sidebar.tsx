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
  CircleDollarSign,
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
      { label: "Employer onboarding", icon: Building2,    to: "/employer-enquiries" },
      { label: "Employers",           icon: UserCircle2,  to: "/employers"          },
      { label: "Employees",           icon: Users,        to: "/employees"          },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Salary requests", icon: Wallet,            to: "/salary-requests" },
      { label: "Disbursals",      icon: ArrowDownCircle,   to: "/disbursals"      },
      { label: "Repayments",      icon: RefreshCcw,        to: "/repayments"      },
      { label: "Settlements",     icon: CircleDollarSign,  to: "/settlements"     },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "KYC verification",  icon: FileCheck, to: "/kyc"               },
      { label: "Bank verification", icon: Landmark,  to: "/bank-verification" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", icon: Settings, to: "/settings" }],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[228px] h-screen bg-white flex flex-col flex-shrink-0 border-r border-slate-100">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-5 border-b border-slate-100 gap-3">
        <div className="w-[24px] h-[24px] rounded-[6px] bg-[#c4522a] flex items-center justify-center text-white text-[11px] font-[700]">
          M
        </div>
        <span className="text-[13px] font-[600] text-slate-900 tracking-tight">MobPae</span>
        <span className="text-[10px] text-slate-400 mt-px">admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-[700] uppercase tracking-[0.1em] text-slate-400 px-2.5 mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-[7px] rounded-md text-[12.5px] transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-[600]"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} className={isActive ? "text-[#c4522a]" : "text-slate-400"} />
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
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-[600]">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-[600] text-slate-800 leading-none truncate">Admin User</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
