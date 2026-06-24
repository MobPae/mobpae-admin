import { LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { removeToken } from "../../utils/auth";
import { NotificationBell } from "./NotificationBell";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore API errors — still clear local session
    } finally {
      removeToken();
      navigate("/login");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-end">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-[#6B7280]" />

          <input
            placeholder="Search..."
            className="
              w-64
              pl-9
              pr-4
              py-2.5
              text-sm
              bg-[#F8F9FC]
              border
              border-[#E5E7EB]
              rounded-xl
              outline-none
              focus:border-[#6C4CFF]
            "
          />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-4">
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-[#6C4CFF]
              text-white
              flex
              items-center
              justify-center
              font-semibold
            "
          >
            A
          </div>

          <div>
            <p className="text-sm font-medium text-[#111827]">Admin User</p>

            <p className="text-xs text-[#6B7280]">Super Admin</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            h-10
            px-4
            rounded-xl
            border
            border-[#E5E7EB]
            text-[#6B7280]
            hover:bg-[#F8F9FC]
            flex
            items-center
            gap-2
            text-sm
            font-medium
          "
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
