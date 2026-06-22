import { Search, RefreshCw } from "lucide-react";

export default function EmployerFilters() {
  return (
    <div className="bg-white border border-[#E4E4EF] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-[#62657A]"
          />

          <input
            type="text"
            placeholder="Search employer..."
            className="w-full border border-[#E4E4EF] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#7679FF]"
          />
        </div>

        <select className="border border-[#E4E4EF] rounded-xl px-4 py-3">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

        <button className="bg-[#F0F0F8] hover:bg-[#E4E4EF] rounded-xl px-4 py-3 flex items-center gap-2">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
    </div>
  );
}
