import { Mail, User, ChevronRight } from "lucide-react";

interface EmployerCardProps {
  companyName: string;
  contactPerson: string;
  email: string;
  status: string;
  onView: () => void;
}

export default function EmployerCard({
  companyName,
  contactPerson,
  email,
  status,
  onView,
}: EmployerCardProps) {
  const companyInitial = companyName.charAt(0);

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-4
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-1
        transition-all
        duration-200
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm
            "
          >
            {companyInitial}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {companyName}
            </h3>

            <p className="text-xs text-slate-500">Technology Services</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs text-xs ${
            status === "APPROVED"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status === "APPROVED" ? "Approved" : "Pending Review"}
        </span>
      </div>

      {/* Contact Section */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <User size={18} className="text-slate-400 mt-0.5" />

          <div>
            <p className="text-slate-900 font-medium">{contactPerson}</p>

            <p className="text-sm text-slate-500">Founder & HR Admin</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail size={18} className="text-slate-400 mt-0.5" />

          <p className="text-slate-600">{email}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Employees</p>

            <p className="font-semibold">250</p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-400">Requested</p>

            <p className="font-semibold">Today</p>
          </div>
        </div>

        <button
          onClick={onView}
          className="
            flex
            items-center
            gap-1
            px-4
            py-2
            border
            border-slate-200
            rounded-xl
            text-blue-600
            text-xs
            hover:bg-slate-50
          "
        >
          Review
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
