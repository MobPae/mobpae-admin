import DashboardCard from "../components/dashboard/DashboardCard";

import { Building2, Users, FileCheck, Wallet } from "lucide-react";

export default function DashboardPage() {
  const cards = [
    {
      title: "Total Employers",
      value: 12,
      trend: "+2 this month",
      icon: <Building2 size={24} />,
    },
    {
      title: "Total Employees",
      value: 345,
      trend: "+18 this month",
      icon: <Users size={24} />,
    },
    {
      title: "Pending KYC",
      value: 5,
      trend: "2 this week",
      icon: <FileCheck size={24} />,
    },
    {
      title: "Pending Requests",
      value: 8,
      trend: "3 this week",
      icon: <Wallet size={24} />,
    },
    {
      title: "Disbursed This Month",
      value: "₹1.2L",
      trend: "+12%",
      icon: <Wallet size={24} />,
    },
    {
      title: "Repaid This Month",
      value: "₹95K",
      trend: "+8%",
      icon: <Wallet size={24} />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>

          <ul className="space-y-3">
            <li>🔔 5 KYC Verifications Pending</li>
            <li>🔔 3 Salary Requests Awaiting Approval</li>
            <li>🔔 2 Disbursals Pending</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>

          <ul className="space-y-3">
            <li>Salary Limit Assigned</li>
            <li>Salary Request Approved</li>
            <li>Repayment Completed</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Salary Requests</h3>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3">Employee</th>
              <th className="py-3">Employer</th>
              <th className="py-3">Amount</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-3">Amit Kumar</td>
              <td>Acme Tech</td>
              <td>₹15,000</td>
              <td>SUBMITTED</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">Rahul Singh</td>
              <td>Infosys</td>
              <td>₹20,000</td>
              <td>APPROVED</td>
            </tr>

            <tr>
              <td className="py-3">Priya Sharma</td>
              <td>TCS</td>
              <td>₹10,000</td>
              <td>DISBURSED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
