import { Bell, Pencil, Settings2, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage platform-wide configuration.
        </p>
      </div>

      {/* Platform Rules */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Settings2 size={14} />
            Platform Rules
          </div>

          <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <Pencil size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          <ConfigRow label="Advance Percentage" value="40%" />

          <ConfigRow label="Interest Charge" value="1%" />

          <ConfigRow label="Processing Fee" value="0%" />

          <ConfigRow label="Minimum Salary" value="₹10,000" />

          <ConfigRow label="Maximum Advance" value="₹100,000" />
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* Risk */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              <ShieldCheck size={14} />
              Risk Controls
            </div>

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <Pencil size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <SettingRow label="Require KYC" active />

            <SettingRow label="Bank Verification" active />

            <SettingRow label="Multiple Requests" active={false} />

            <SettingRow label="Outstanding Balance" active={false} />
          </div>
        </div>

        {/* Notifications */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5m rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Bell size={14} />
              Notifications
            </div>

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <Pencil size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <SettingRow label="Salary Alerts" active />

            <SettingRow label="Repayment Alerts" active />

            <SettingRow label="KYC Alerts" active />

            <SettingRow label="Bank Alerts" active />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          className="
              px-5
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-medium
            "
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>

      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function SettingRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>

      <span
        className={`
            px-2.5 py-1 rounded-full text-[11px] font-medium
            ${
              active
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }
          `}
      >
        {active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
