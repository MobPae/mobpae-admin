import { useEffect, useState } from "react";
import EmployerStats from "../components/employer-enquiries/EmployerStats";
import EmployerFilters from "../components/employer-enquiries/EmployerFilters";
import EmployerCard from "../components/employer-enquiries/EmployerCard";
import EmployerDetailsDrawer from "../components/employer-enquiries/EmployerDetailsDrawer";

import { getEmployerEnquiries } from "../services/employerEnquiryService";

type EmployerEnquiry = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  employeeCount: number;
  status: string;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function EmployerEnquiriesPage() {
  const [loading, setLoading] = useState(true);

  const [enquiries, setEnquiries] = useState<EmployerEnquiry[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedEmployer, setSelectedEmployer] =
    useState<EmployerEnquiry | null>(null);

  const loadEnquiries = async () => {
    try {
      const data = await getEmployerEnquiries();

      setEnquiries(data);
    } catch (error) {
      console.error("Failed to load employer enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading employer enquiries...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Employer Onboarding
          </h1>

          <p className="text-slate-500 mt-2">
            Review and approve employer onboarding requests.
          </p>
        </div>

        <button
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-xl
            font-medium
          "
        >
          + New Employer
        </button>
      </div>

      {/* Stats */}
      <EmployerStats />

      {/* Filters */}
      <EmployerFilters />

      {/* Empty State */}
      {enquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Employer Enquiries
          </h3>

          <p className="text-slate-500 mt-2">
            Employer onboarding requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {enquiries.map((employer) => (
            <EmployerCard
              key={employer.id}
              companyName={employer.companyName}
              contactPerson={employer.contactPerson}
              email={employer.email}
              status={employer.status}
              onView={() => {
                setSelectedEmployer(employer);
                setDrawerOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <EmployerDetailsDrawer
        open={drawerOpen}
        employer={selectedEmployer}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployer(null);
        }}
        onApproved={loadEnquiries}
      />
    </div>
  );
}
