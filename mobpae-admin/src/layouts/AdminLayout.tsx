import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, LogOut } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { NotificationBell } from "../components/layout/NotificationBell";
import { removeToken } from "../utils/auth";
import { useState } from "react";
import { ConfirmModal } from "../components/ui/ConfirmModal";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employer-enquiries": "Enquiries",
  "/employers": "Employers",
  "/employees": "Employees",
  "/salary-requests": "Salary requests",
  "/disbursals": "Disbursals",
  "/recoveries": "Recoveries",
  "/repayments": "Repayments",
  "/settlements": "Settlements",
  "/memberships": "Memberships",
  "/revenue": "Revenue",
  "/kyc": "KYC verification",
  "/bank-verification": "Bank verification",
  "/settings": "Settings",
  "/audit-logs": "Audit Logs",
  "/jobs": "Scheduled Jobs",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? "MobPae Admin";
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="admin-portal h-screen overflow-hidden flex" style={{ background: "#f8fafc" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-11 bg-white flex items-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid #e2e8f0" }}>
          <span className="text-[13px] font-[500]" style={{ color: "#191A2E" }}>{pageTitle}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <div className="w-px h-4 mx-2" style={{ background: "#e2e8f0" }} />
            <div className="flex items-center gap-2 mr-1">
              <div className="w-6 h-6 rounded-full bg-[#7679FF] text-white flex items-center justify-center text-[11px] font-[500]">
                A
              </div>
              <span className="text-[12px]" style={{ color: "#475569" }}>Admin</span>
            </div>
            <button
              onClick={() => navigate("/change-password")}
              aria-label="Change password"
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-[#6b7280] hover:text-[#7679FF] hover:bg-[#ECEBFF]"
              title="Change Password"
            >
              <KeyRound size={13} />
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              aria-label="Log out"
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-[#6b7280] hover:text-red-500 hover:bg-red-50"
              title="Log out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
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
    </div>
  );
}
