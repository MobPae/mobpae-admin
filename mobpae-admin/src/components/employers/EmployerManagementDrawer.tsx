import { Building2, User, Calendar, X, CheckCircle, Ban } from "lucide-react";
import { updateEmployerStatus } from "../../services/employerService";

interface Employer {
  id: string;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  payrollDate: number;
  payrollCutoffDate: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface EmployerManagementDrawerProps {
  open: boolean;
  onClose: () => void;
  employer: Employer | null;
}

export default function EmployerManagementDrawer({
  open,
  onClose,
  employer,
}: EmployerManagementDrawerProps) {
  if (!open || !employer) return null;

  const handleStatusChange = async () => {
    const confirmed = window.confirm(
      employer.status === "ACTIVE"
        ? "Deactivate this employer?"
        : "Activate this employer?"
    );

    if (!confirmed) return;

    try {
      const newStatus = employer.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

      await updateEmployerStatus(employer.id, newStatus);

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert("Failed to update employer status");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[620px] bg-slate-50 shadow-xl z-50 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {employer.companyName}
                </h2>

                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employer.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employer.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>

                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">
                      Last Updated{" "}
                      {new Date(
                        employer.updatedAt || employer.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Business Information */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={16} className="text-blue-600" />

                <h3 className="text-[14px] font-semibold text-slate-900">
                  Business Information
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Company Name</span>

                  <span className="text-xs font-medium text-slate-900">
                    {employer.companyName}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Company Code</span>

                  <span className="text-xs text-slate-900">
                    {employer.companyCode}
                  </span>
                </div>

                {/* <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Status</span>

                  <span className="text-xs text-slate-900">
                    {employer.status}
                  </span>
                </div> */}
                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Status</span>

                  <span className="text-xs text-slate-900">
                    {employer.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Last Updated</span>

                  <span className="text-xs text-slate-900">
                    {new Date(
                      employer.updatedAt || employer.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <User size={16} className="text-blue-600" />

                <h3 className="text-[14px] font-semibold text-slate-900">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Contact Person</span>

                  <span className="text-xs text-slate-900">
                    {employer.contactPerson}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Email</span>

                  <span className="text-xs text-slate-900">
                    {employer.email}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Phone</span>

                  <span className="text-xs text-slate-900">
                    {employer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Payroll Configuration */}
            <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={16} className="text-blue-600" />

                <h3 className="text-[14px] font-semibold text-slate-900">
                  Payroll Configuration
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">Payroll Date</span>

                  <span className="text-xs text-slate-900">
                    {employer.payrollDate}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-xs text-slate-500">
                    Payroll Cutoff Date
                  </span>

                  <span className="text-xs text-slate-900">
                    {employer.payrollCutoffDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white p-4">
          {employer.status === "ACTIVE" ? (
            <button
              onClick={handleStatusChange}
              className="
        w-full
        bg-red-600
        hover:bg-red-500
        text-white
        py-3
        rounded-xl
        font-medium
        transition-all
        flex
        items-center
        justify-center
        gap-2
      "
            >
              <Ban size={18} />
              Deactivate Employer
            </button>
          ) : (
            <button
              onClick={handleStatusChange}
              className="
        w-full
        bg-green-600
        hover:bg-green-700
        text-white
        py-3
        rounded-xl
        font-medium
        transition-all
        flex
        items-center
        justify-center
        gap-2
      "
            >
              <CheckCircle size={18} />
              Activate Employer
            </button>
          )}
        </div>
      </div>
    </>
  );
}
