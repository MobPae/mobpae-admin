import { useState } from "react";
import EmployerDetailsDrawer from "./EmployerDetailsDrawer";

type EmployerEnquiry = {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  status: string;
};

const enquiries = [
  {
    id: 1,
    companyName: "ABC Tech",
    contactPerson: "Rahul Sharma",
    email: "rahul@abctech.com",
    status: "PENDING",
  },
  {
    id: 2,
    companyName: "XYZ Pvt Ltd",
    contactPerson: "Amit Singh",
    email: "amit@xyz.com",
    status: "APPROVED",
  },
  {
    id: 3,
    companyName: "Acme Solutions",
    contactPerson: "Priya Verma",
    email: "priya@acme.com",
    status: "PENDING",
  },
];

export default function EmployerEnquiriesTable() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedEmployer, setSelectedEmployer] =
    useState<EmployerEnquiry | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Company Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="border-b">
                <td className="py-4">{enquiry.companyName}</td>
                <td>{enquiry.contactPerson}</td>
                <td>{enquiry.email}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enquiry.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </td>

                <td>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => {
                      setSelectedEmployer(enquiry);
                      setDrawerOpen(true);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmployerDetailsDrawer
        open={drawerOpen}
        employer={selectedEmployer}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
