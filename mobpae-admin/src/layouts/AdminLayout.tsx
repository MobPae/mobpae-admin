import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { NotificationBell } from "../components/layout/NotificationBell";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useEscKey } from "../lib/useEscKey";
import { getRoleLabel, getTokenName, removeToken } from "../utils/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const adminName = getTokenName() ?? "Admin";
  const initials = adminName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = adminName.split(" ")[0];

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEscKey(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="admin-portal flex h-screen overflow-hidden bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-[60px] flex-shrink-0 items-center gap-4 border-b border-edge bg-surface px-6">
          <div className="flex-1" />

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />

            <div className="mx-1 h-5 w-px bg-edge" />

            {/* User chip */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-surface-raised"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B7CFF] to-brand text-[12px] font-bold text-white">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-[13px] font-semibold leading-none text-ink">{firstName}</p>
                  <p className="mt-0.5 text-2xs text-ink-4">{getRoleLabel()}</p>
                </div>
                <ChevronDown size={14} className={`text-ink-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-edge bg-surface shadow-overlay">
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/change-password"); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-muted"
                  >
                    <KeyRound size={14} className="text-ink-4" />
                    Change password
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmLogout(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              )}
            </div>
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
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
