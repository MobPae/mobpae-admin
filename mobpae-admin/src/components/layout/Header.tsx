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
    <header className="h-16 bg-white border-b border-edge px-8 flex items-center justify-end">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-ink-3" />

          <input
            placeholder="Search..."
            className="
              w-64
              pl-9
              pr-4
              py-2.5
              text-sm
              bg-canvas
              border
              border-edge
              rounded-xl
              outline-none
              focus:border-brand
            "
          />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-edge pl-4">
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-brand
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
            <p className="text-sm font-medium text-ink">Admin User</p>

            <p className="text-xs text-ink-3">Super Admin</p>
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
            border-edge
            text-ink-3
            hover:bg-canvas
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
