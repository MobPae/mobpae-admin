import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowDownCircle,
  Building2,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  RefreshCcw,
  ScrollText,
  Settings,
  Sliders,
  Smartphone,
  TrendingUp,
  UserCircle2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { getTokenName, removeToken } from "../../utils/auth";
import { ConfirmModal } from "../ui/ConfirmModal";

interface NavItem { label: string; icon: LucideIcon; to: string; }
interface Section  { title: string; items: NavItem[]; }

const SECTIONS: Section[] = [
  {
    title: "Overview",
    items: [{ label: "Home", icon: LayoutDashboard, to: "/dashboard" }],
  },
  {
    title: "Operations",
    items: [
      { label: "Enquiries", icon: Building2,    to: "/employer-enquiries" },
      { label: "Employers", icon: UserCircle2,  to: "/employers"          },
      { label: "Employees", icon: Users,        to: "/employees"          },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Advances",    icon: Wallet,           to: "/loan-applications" },
      { label: "Disbursals",  icon: ArrowDownCircle,  to: "/disbursals"        },
      { label: "Repayments",  icon: RefreshCcw,       to: "/repayments"        },
      { label: "Settlements", icon: CircleDollarSign, to: "/settlements"       },
      { label: "Memberships", icon: CreditCard,       to: "/memberships"       },
      { label: "Revenue",     icon: TrendingUp,       to: "/revenue"           },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "KYC Reviews",       icon: FileCheck, to: "/kyc"               },
      { label: "Bank Verification", icon: Landmark,  to: "/bank-verification" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "App Content",    icon: Smartphone,    to: "/app-information" },
      { label: "Loan Product",   icon: Sliders,       to: "/loan-product"    },
      { label: "Audit Logs",     icon: ScrollText,    to: "/audit-logs"      },
      { label: "Scheduled Jobs", icon: CalendarClock, to: "/jobs"            },
      { label: "Settings",       icon: Settings,      to: "/settings"        },
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
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-edge bg-surface">
      {/* Logo */}
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-edge px-5">
        <img src="/logo-icon.svg" alt="MobPae" width="32" height="21" className="flex-shrink-0 object-contain" />
        <span className="text-[15px] font-bold tracking-tight text-ink">MobPae</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-1 px-3 text-2xs font-semibold uppercase tracking-[0.07em] text-ink-4">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ label, icon: Icon, to }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-all ${
                        isActive
                          ? "bg-brand-soft font-semibold text-brand"
                          : "text-ink-3 hover:bg-surface-muted"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2 : 1.75}
                          className={`flex-shrink-0 ${isActive ? "text-brand" : "text-ink-4"}`}
                        />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer — user info */}
      <div className="flex-shrink-0 border-t border-edge px-3 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B7CFF] to-brand text-[12px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-none text-ink">{adminName}</p>
            <p className="mt-0.5 text-2xs text-ink-4">Super Admin</p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate("/change-password")}
              title="Change password"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-brand-soft hover:text-brand"
            >
              <KeyRound size={13} />
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              title="Log out"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-danger-soft hover:text-danger"
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
