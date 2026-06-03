import { useState } from "react";
import {
  Building2,
  User,
  ClipboardList,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { approveEmployerEnquiry } from "../../services/employerEnquiryService";
import type { EmployerEnquiry } from "../../types/employer-enquiry";

interface EmployerDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  onApproved?: () => void;
  employer: EmployerEnquiry | null;
}

export default function EmployerDetailsDrawer({
  open,
  onClose,
  onApproved,
  employer,
}: EmployerDetailsDrawerProps) {
  const [companyCode, setCompanyCode] = useState("");
  const [payrollDate, setPayrollDate] = useState("");
  const [payrollCutoffDate, setPayrollCutoffDate] = useState("");

  const [approving, setApproving] = useState(false);

  if (!open || !employer) return null;

  const handleApprove = async () => {
    if (!companyCode || !payrollDate || !payrollCutoffDate) {
      alert("Please fill all approval fields");
      return;
    }

    try {
      setApproving(true);

      await approveEmployerEnquiry(employer.id, {
        companyCode,
        payrollDate: Number(payrollDate),
        payrollCutoffDate: Number(payrollCutoffDate),
      });

      alert("Employer approved successfully");

      onApproved?.();
      onClose();
    } catch (error) {
      console.error(error);

      alert("Failed to approve employer");
    } finally {
      setApproving(false);
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

                <div className="mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employer.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {employer.status}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-slate-200">
              <div className="flex gap-8">
                <button className="pb-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  Overview
                </button>

                <button className="pb-3 text-xs text-slate-500">
                  Documents
                </button>

                <button className="pb-3 text-xs text-slate-500">
                  Timeline
                </button>
              </div>
            </div>

            {/* Business Information */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={16} className="text-blue-600" />

                <h3 className="text-[14px] font-semibold text-slate-900">
                  Business Information
                </h3>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">
                    Company Name
                  </span>

                  <span className="text-[12px] text-slate-900 font-medium">
                    {employer.companyName}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">Industry</span>

                  <span className="text-[12px] text-slate-900">
                    Technology Services
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">
                    Company Size
                  </span>

                  <span className="text-[12px] text-slate-900">
                    {employer.employeeCount} Employees
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

              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">
                    Contact Person
                  </span>

                  <span className="text-[12px] text-slate-900 font-medium">
                    {employer.contactPerson}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">Email</span>

                  <span className="text-[12px] text-slate-900">
                    {employer.email}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">Phone</span>

                  <span className="text-[12px] text-slate-900">
                    {employer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Onboarding Details */}
            <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList size={16} className="text-blue-600" />

                <h3 className="text-[14px] font-semibold text-slate-900">
                  Onboarding Details
                </h3>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">
                    Requested On
                  </span>

                  <span className="text-[12px] text-slate-900">
                    {new Date(employer.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-[12px] text-slate-500">Status</span>

                  <span className="text-[12px] text-slate-900">
                    {employer.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Configuration */}
            {employer.status !== "APPROVED" && (
              <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-[14px] font-semibold text-slate-900 mb-4">
                  Approval Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">
                      Company Code
                    </label>

                    <input
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      placeholder="ABC001"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-2">
                      Payroll Date
                    </label>

                    <input
                      type="number"
                      value={payrollDate}
                      onChange={(e) => setPayrollDate(e.target.value)}
                      placeholder="30"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-2">
                      Payroll Cutoff Date
                    </label>

                    <input
                      type="number"
                      value={payrollCutoffDate}
                      onChange={(e) => setPayrollCutoffDate(e.target.value)}
                      placeholder="25"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <button className="w-40 border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 flex items-center justify-center gap-2">
              <XCircle size={18} />
              Reject
            </button>

            {employer.status !== "APPROVED" && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="
                  flex-1
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-3
                  rounded-xl
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-60
                "
              >
                <CheckCircle size={18} />
                {approving ? "Approving..." : "Approve Employer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
