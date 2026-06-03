import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  Landmark,
  Wallet,
  CreditCard,
  Settings,
  ShieldCheck,
} from "lucide-react";

import SidebarSection from "./SidebarSection";

interface SidebarProps {
  activePage: string;
  onMenuClick: (page: string) => void;
}

export default function Sidebar({ activePage, onMenuClick }: SidebarProps) {
  const MenuItem = ({
    label,
    icon: Icon,
    page,
  }: {
    label: string;
    icon: React.ElementType;
    page: string;
  }) => (
    <button
      onClick={() => onMenuClick(page)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-[14px] font-medium ${
        activePage === page
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="w-72 bg-[#081028] text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">MobPae</h1>

        <p className="text-sm text-slate-400 mt-1">Admin Portal</p>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 py-4">
        <SidebarSection title="Overview">
          <MenuItem label="Dashboard" icon={LayoutDashboard} page="dashboard" />
        </SidebarSection>

        <SidebarSection title="Operations">
          <MenuItem
            label="Employer Onboarding"
            icon={Building2}
            page="employer-enquiries"
          />

          <MenuItem label="Employers" icon={Building2} page="employers" />

          <MenuItem label="Employees" icon={Users} page="employees" />
        </SidebarSection>

        <SidebarSection title="Finance">
          <MenuItem
            label="Salary Requests"
            icon={Wallet}
            page="salary-requests"
          />

          <MenuItem label="Disbursements" icon={CreditCard} page="disbursals" />

          <MenuItem label="Repayments" icon={CreditCard} page="repayments" />
        </SidebarSection>

        <SidebarSection title="Compliance">
          <MenuItem label="KYC Verification" icon={FileCheck} page="kyc" />

          <MenuItem label="Bank Verification" icon={Landmark} page="bank" />
        </SidebarSection>

        <SidebarSection title="Settings">
          <MenuItem label="Users & Roles" icon={ShieldCheck} page="users" />

          <MenuItem label="Settings" icon={Settings} page="settings" />
        </SidebarSection>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-semibold">
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
