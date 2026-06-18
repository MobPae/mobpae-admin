import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, KeyRound, LogOut } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { removeToken } from "../utils/auth";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employer-enquiries": "Enquiries",
  "/employers": "Employers",
  "/employees": "Employees",
  "/salary-requests": "Salary requests",
  "/disbursals": "Disbursals",
  "/repayments": "Repayments",
  "/kyc": "KYC verification",
  "/bank-verification": "Bank verification",
  "/settings": "Settings",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? "MobPae Admin";

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: "#faf4ef" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-11 bg-white flex items-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid #ede5dc" }}>
          <span className="text-[13px] font-[500]" style={{ color: "#1a1a1a" }}>{pageTitle}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-[#9a8070] hover:text-[#c4522a] hover:bg-[#fdf3ee]">
              <Bell size={14} />
            </button>
            <div className="w-px h-4 mx-2" style={{ background: "#e2e8f0" }} />
            <div className="flex items-center gap-2 mr-1">
              <div className="w-6 h-6 rounded-full bg-[#c4522a] text-white flex items-center justify-center text-[10px] font-[500]">
                A
              </div>
              <span className="text-[12px]" style={{ color: "#475569" }}>Admin</span>
            </div>
            <button
              onClick={() => navigate("/change-password")}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-[#9a8070] hover:text-[#c4522a] hover:bg-[#fdf3ee]"
              title="Change Password"
            >
              <KeyRound size={13} />
            </button>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-[#9a8070] hover:text-red-500 hover:bg-red-50"
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
    </div>
  );
}
