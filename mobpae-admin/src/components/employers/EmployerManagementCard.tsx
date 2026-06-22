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
        border-[#E4E4EF]
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
              from-[#7679FF]
              to-[#5659D9]
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
            <h3 className="text-base font-semibold text-[#191A2E]">
              {companyName}
            </h3>

            <p className="text-xs text-[#62657A] mt-1">Code: {companyCode}</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "ACTIVE"
              ? "bg-[#EBF6E3] text-[#3B6D11]"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3">
          <User size={18} className="text-[#62657A] mt-0.5" />

          <div>
            <p className="text-[#191A2E] font-medium">{contactPerson}</p>

            <p className="text-sm text-[#62657A]">Primary Contact</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail size={18} className="text-[#62657A] mt-0.5" />

          <p className="text-[#62657A]">{email}</p>
        </div>

        <div className="flex items-start gap-3">
          <Building2 size={18} className="text-[#62657A] mt-0.5" />

          <p className="text-[#62657A]">Payroll Date: {payrollDate}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[#E4E4EF] flex items-center justify-end">
        <button
          onClick={onView}
          className="
            flex
            items-center
            gap-1
            px-4
            py-2
            border
            border-[#E4E4EF]
            rounded-xl
            text-[#7679FF]
            text-xs
            hover:bg-[#F7F7FB]
          "
        >
          View Details
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
