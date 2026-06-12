import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { removeToken } from "../utils/auth";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employer-enquiries": "Employer onboarding",
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
    <div className="h-screen overflow-hidden flex bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-11 bg-white border-b border-slate-100 flex items-center px-5 flex-shrink-0">
          <span className="text-[13px] font-[500] text-slate-800">{pageTitle}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={14} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-2" />
            <div className="flex items-center gap-2 mr-1">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-[500]">
                A
              </div>
              <span className="text-[12px] text-slate-500">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
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
