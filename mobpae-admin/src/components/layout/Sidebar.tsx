import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ScrollText,
  Building2,
  UserCircle2,
  Users,
  FileCheck,
  Landmark,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  RefreshCcw,
  CircleDollarSign,
  CreditCard,
  Settings,
  CalendarClock,
  KeyRound,
  LogOut,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { removeToken, getTokenName } from "../../utils/auth";
import { ConfirmModal } from "../ui/ConfirmModal";

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
    items: [{ label: "Home", icon: LayoutDashboard, to: "/dashboard" }],
  },
  {
    title: "Operations",
    items: [
      { label: "Enquiries",  icon: Building2,   to: "/employer-enquiries" },
      { label: "Employers",  icon: UserCircle2, to: "/employers"          },
      { label: "Employees",  icon: Users,       to: "/employees"          },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Advances",     icon: Wallet,           to: "/loan-applications" },
      { label: "Disbursals",   icon: ArrowDownCircle,  to: "/disbursals"      },
      { label: "Repayments",   icon: RefreshCcw,       to: "/repayments"      },
      { label: "Settlements",  icon: CircleDollarSign, to: "/settlements"     },
      { label: "Memberships",  icon: CreditCard,       to: "/memberships"     },
      { label: "Revenue",      icon: TrendingUp,       to: "/revenue"         },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "KYC Reviews",        icon: FileCheck, to: "/kyc"               },
      { label: "Bank Verification",  icon: Landmark,  to: "/bank-verification" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "App Content",     icon: Smartphone,    to: "/app-information" },
      { label: "Audit Logs",      icon: ScrollText,    to: "/audit-logs"      },
      { label: "Scheduled Jobs",  icon: CalendarClock, to: "/jobs"            },
      { label: "Settings",        icon: Settings,      to: "/settings"        },
    ],
  },
];


export default function Sidebar() {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const adminName = getTokenName?.() ?? "Admin";
  const initials = adminName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <aside
      className="w-60 h-screen flex flex-col flex-shrink-0 bg-white"
      style={{ borderRight: "1px solid #E5E7EB" }}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 gap-3 flex-shrink-0" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <img src="/logo-icon.svg" alt="MobPae" width="32" height="21" style={{ objectFit: "contain", flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>MobPae</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {SECTIONS.flatMap((s) => s.items).map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 rounded-xl transition-all ${isActive ? "" : "hover:bg-gray-50"}`
              }
              style={({ isActive }) => ({
                height: 40,
                background: isActive ? "#F3F0FF" : "transparent",
                color: isActive ? "#6C4CFF" : "#6B7280",
                fontWeight: isActive ? 600 : 500,
                fontSize: 13.5,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} style={{ color: isActive ? "#6C4CFF" : "#9CA3AF", flexShrink: 0 }} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer — user info */}
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-[700] flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #8B7CFF 0%, #6C4CFF 100%)", color: "white" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1 }} className="truncate">{adminName}</p>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Super Admin</p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate("/change-password")}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F3F0FF]"
              title="Change password"
              style={{ color: "#9CA3AF" }}
            >
              <KeyRound size={13} />
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 hover:text-red-500"
              title="Log out"
              style={{ color: "#9CA3AF" }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title="Log out of MobPae Admin?"
        description="Your current admin session will end on this device."
        confirmLabel="Log out"
        loading={false}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </aside>
  );
}
