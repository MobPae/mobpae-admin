import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-end">
      {/* Right Side */}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />

          <input
            placeholder="Search..."
            className="
              w-64
              pl-9
              pr-4
              py-2.5
              text-sm
              bg-slate-50
              border
              border-slate-200
              rounded-xl
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* Notifications */}
        <button
          className="
            w-10
            h-10
            rounded-xl
            border
            border-slate-200
            flex
            items-center
            justify-center
            hover:bg-slate-50
          "
        >
          <Bell size={18} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-blue-600
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
            <p className="text-sm font-medium text-slate-900">Admin User</p>

            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
