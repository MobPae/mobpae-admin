import { Mail, User, ChevronRight, Building2 } from "lucide-react";

interface EmployerManagementCardProps {
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  payrollDate: number;
  status: string;
  onView: () => void;
}

export default function EmployerManagementCard({
  companyName,
  companyCode,
  contactPerson,
  email,
  payrollDate,
  status,
  onView,
}: EmployerManagementCardProps) {
  const companyInitial = companyName.charAt(0);

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-5
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
            className="
              w-12
              h-12
              rounded-xl
              bg-gradient-to-br
              from-blue-500
              to-indigo-600
              text-white
              flex
              items-center
              justify-center
              font-semibold
            "
          >
            {companyInitial}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {companyName}
            </h3>

            <p className="text-xs text-slate-500 mt-1">Code: {companyCode}</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3">
          <User size={18} className="text-slate-400 mt-0.5" />

          <div>
            <p className="text-slate-900 font-medium">{contactPerson}</p>

            <p className="text-sm text-slate-500">Primary Contact</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail size={18} className="text-slate-400 mt-0.5" />

          <p className="text-slate-600">{email}</p>
        </div>

        <div className="flex items-start gap-3">
          <Building2 size={18} className="text-slate-400 mt-0.5" />

          <p className="text-slate-600">Payroll Date: {payrollDate}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
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
          View Details
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
