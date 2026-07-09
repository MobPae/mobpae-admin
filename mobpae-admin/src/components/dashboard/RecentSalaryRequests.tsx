import { IndianRupee, ArrowRight } from "lucide-react";

export default function RecentSalaryRequests() {
  const requests = [
    {
      employee: {
        name: "Amit Kumar",
        code: "EMP001",
        employer: "XYZ Industries",
      },
      amount: "₹10,000",
      status: "SUBMITTED",
      requestedAt: "5 mins ago",
    },
    {
      employee: {
        name: "Rahul Sharma",
        code: "EMP002",
        employer: "ABC Technologies",
      },
      amount: "₹15,000",
      status: "APPROVED",
      requestedAt: "15 mins ago",
    },
    {
      employee: {
        name: "Priya Patel",
        code: "EMP003",
        employer: "PQR Solutions",
      },
      amount: "₹8,000",
      status: "DISBURSED",
      requestedAt: "30 mins ago",
    },
    {
      employee: {
        name: "Vikram Singh",
        code: "EMP004",
        employer: "Infosys",
      },
      amount: "₹20,000",
      status: "REPAID",
      requestedAt: "1 hour ago",
    },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-amber-100 text-amber-700";

      case "EMPLOYER_APPROVED":
        return "bg-[#DBEAFE] text-[#1D4ED8]";

      case "AWAITING_MEMBERSHIP_PAYMENT":
        return "bg-amber-100 text-amber-700";

      case "READY_FOR_DISBURSAL":
        return "bg-[#DCFCE7] text-[#15803D]";

      case "APPROVED":
        return "bg-[#DBEAFE] text-[#1D4ED8]";

      case "DISBURSED":
        return "bg-[#DCFCE7] text-[#15803D]";

      case "REPAID":
        return "bg-[#DCFCE7] text-[#166534]";

      default:
        return "bg-[#F3F4F6] text-[#6B7280]";
    }
  };

  return (
    <div className="col-span-6 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            Recent Loan Applications
          </h3>

          <p className="text-xs text-[#6B7280] mt-1">
            Latest employee advance applications
          </p>
        </div>

        <button className="text-xs font-medium text-[#315eff] hover:text-[#2048EE] flex items-center gap-1">
          View All
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#E5E7EB]">
        {requests.slice(0, 3).map((request, index) => (
          <div
            key={index}
            className="
                px-6
                py-4
                flex
                items-center
                justify-between
                hover:bg-[#F8F9FC]
                transition-all
              "
          >
            {/* Employee */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#6B7280]">
                {request.employee.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </div>

              <div>
                <p className="text-sm font-medium text-[#111827]">
                  {request.employee.name}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[#6B7280]">
                    {request.employee.code}
                  </span>

                  <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />

                  <span className="text-[11px] text-[#6B7280]">
                    {request.employee.employer}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount + Status */}
            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IndianRupee size={12} className="text-[#6B7280]" />

                  <span className="text-sm font-semibold text-[#111827]">
                    {request.amount.replace("₹", "")}
                  </span>
                </div>

                <span className="text-[11px] text-[#6B7280]">
                  {request.requestedAt}
                </span>
              </div>

              <span
                className={`
                    px-2.5
                    py-1
                    rounded-full
                    text-[11px]
                    font-medium
                    whitespace-nowrap
                    ${getStatusClass(request.status)}
                  `}
              >
                {request.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
