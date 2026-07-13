import { Outlet } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { NotificationBell } from "../components/layout/NotificationBell";
import { getTokenName } from "../utils/auth";

export default function AdminLayout() {
  const adminName = getTokenName() ?? "Admin";
  const initials = adminName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = adminName.split(" ")[0];

  return (
    <div className="admin-portal flex h-screen overflow-hidden bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-[60px] flex-shrink-0 items-center gap-4 border-b border-edge bg-surface px-6">
          {/* Search */}
          <div className="max-w-xl flex-1">
            <div className="flex h-10 items-center gap-2.5 rounded-xl border border-edge bg-canvas px-3.5">
              <Search size={15} className="flex-shrink-0 text-ink-4" />
              <input
                placeholder="Search employers, employees, advances..."
                className="flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-4"
              />
              <div className="flex flex-shrink-0 items-center gap-0.5 rounded-md border border-edge bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-4">
                ⌘ K
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />

            <div className="mx-1 h-5 w-px bg-edge" />

            {/* User chip */}
            <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-surface-raised">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B7CFF] to-brand text-[12px] font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold leading-none text-ink">{firstName}</p>
                <p className="mt-0.5 text-2xs text-ink-4">Super Admin</p>
              </div>
              <ChevronDown size={14} className="text-ink-4" />
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
