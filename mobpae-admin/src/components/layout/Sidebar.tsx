import { NavLink } from "react-router-dom";
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
  Bell,
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
      { label: "Enquiries",             icon: Building2,    to: "/employer-enquiries" },
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
      { label: "Memberships",     icon: CreditCard,        to: "/memberships"     },
      { label: "Revenue",         icon: TrendingUp,        to: "/revenue"         },
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
    items: [
      { label: "Notifications",  icon: Bell,          to: "/notifications" },
      { label: "Audit Logs",     icon: ScrollText,    to: "/audit-logs" },
      { label: "Scheduled Jobs", icon: CalendarClock, to: "/jobs"        },
      { label: "Settings",       icon: Settings,      to: "/settings"    },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside
      className="w-[228px] h-screen flex flex-col flex-shrink-0"
      style={{ background: "#F0F0F8", borderRight: "1px solid #E4E4EF" }}
    >
      {/* Logo */}
      <div className="h-[52px] flex items-center px-5 gap-2.5" style={{ borderBottom: "1px solid #E4E4EF" }}>
        <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-hidden="true" style={{flexShrink:0}}>
          <defs><clipPath id="sb-clip"><rect width="100" height="100" rx="20" ry="20"/></clipPath></defs>
          <rect width="100" height="100" rx="20" ry="20" fill="#7679FF"/>
          <g clipPath="url(#sb-clip)">
            <polygon points="6,100 18,100 68,0 56,0" fill="white" opacity="0.95"/>
            <polygon points="30,100 42,100 92,0 80,0" fill="white" opacity="0.95"/>
            <polygon points="54,100 66,100 100,32 100,8" fill="white" opacity="0.95"/>
          </g>
        </svg>
        <span className="text-[13px] font-[700] tracking-[-0.02em]" style={{ color: "#191A2E" }}>MobPae</span>
        <span className="text-[11px] mt-px font-[600] uppercase" style={{ color: "#8D90A3", letterSpacing: "0.06em" }}>admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-[700] uppercase px-2.5 mb-1.5" style={{ letterSpacing: "0.08em", color: "#AEAEB2" }}>
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-[7px] rounded-lg text-[12.5px] font-[500] transition-colors ${
                      isActive
                        ? "font-[600]"
                        : "hover:bg-black/[0.05]"
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { background: "rgba(118,121,255,0.12)", color: "#5659D9" }
                    : { color: "#62657A" }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} style={{ color: isActive ? "#7679FF" : "#8D90A3" }} />
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
      <div className="px-4 py-4" style={{ borderTop: "1px solid #E4E4EF" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-[700]"
            style={{ background: "#7679FF", color: "white" }}>
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-[600] leading-none truncate" style={{ color: "#191A2E" }}>Admin User</p>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: "#8D90A3" }}>Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
