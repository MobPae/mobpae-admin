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
} from "lucide-react";

import SidebarSection from "./SidebarSection";

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  to: string;
}

function NavItem({ label, icon: Icon, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-[12px] font-medium ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#081028] text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">MobPae</h1>
        <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <SidebarSection title="Overview">
          <NavItem label="Dashboard" icon={LayoutDashboard} to="/dashboard" />
        </SidebarSection>

        <SidebarSection title="Operations">
          <NavItem
            label="Employer Onboarding"
            icon={Building2}
            to="/employer-enquiries"
          />
          <NavItem label="Employers" icon={UserCircle2} to="/employers" />
          <NavItem label="Employees" icon={Users} to="/employees" />
        </SidebarSection>

        <SidebarSection title="Finance">
          <NavItem
            label="Salary Requests"
            icon={Wallet}
            to="/salary-requests"
          />
          <NavItem label="Disbursals" icon={ArrowDownCircle} to="/disbursals" />
          <NavItem label="Repayments" icon={RefreshCcw} to="/repayments" />
        </SidebarSection>

        <SidebarSection title="Compliance">
          <NavItem label="KYC Verification" icon={FileCheck} to="/kyc" />
          <NavItem
            label="Bank Verification"
            icon={Landmark}
            to="/bank-verification"
          />
        </SidebarSection>

        <SidebarSection title="System">
          <NavItem label="Settings" icon={Settings} to="/settings" />
        </SidebarSection>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
