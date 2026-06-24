import { Outlet } from "react-router-dom";
import { Bell, Search, ChevronDown } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { NotificationBell } from "../components/layout/NotificationBell";
import { getTokenName } from "../utils/auth";

export default function AdminLayout() {
  const adminName = getTokenName() ?? "Admin";
  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // First name only for display
  const firstName = adminName.split(" ")[0];

  return (
    <div className="admin-portal h-screen overflow-hidden flex" style={{ background: "#F8F9FC" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-[60px] bg-white flex items-center px-6 gap-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          {/* Search — centered */}
          <div className="flex-1 max-w-xl">
            <div
              className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl"
              style={{ background: "#F8F9FC", border: "1px solid #E5E7EB" }}
            >
              <Search size={15} style={{ color: "#9CA3AF", flexShrink: 0 }} />
              <input
                placeholder="Search employers, employees, advances..."
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  color: "#111827",
                  background: "transparent",
                  outline: "none",
                  border: "none",
                  fontFamily: "inherit",
                }}
              />
              <div
                className="flex items-center gap-0.5 flex-shrink-0"
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 500,
                  background: "#F3F4F6",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                ⌘ K
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notification bell */}
            <NotificationBell />

            {/* Divider */}
            <div className="w-px h-5 mx-1" style={{ background: "#E5E7EB" }} />

            {/* User chip */}
            <button
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-colors hover:bg-gray-50"
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-[700] flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #8B7CFF 0%, #6C4CFF 100%)",
                  color: "white",
                }}
              >
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1 }}>{firstName}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Super Admin</p>
              </div>
              <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
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
