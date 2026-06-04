import { useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import DashboardPage from "../pages/DashboardPage";
import EmployerEnquiriesPage from "../pages/EmployerEnquiriesPage";
import EmployersPage from "../pages/EmployersPage";
import EmployeesPage from "../pages/EmployeesPage";
import SalaryRequestsPage from "../pages/SalaryRequestsPage";
import DisbursalsPage from "../pages/DisbursalsPage";
import RepaymentsPage from "../pages/RepaymentsPage";

export default function AdminLayout() {
  const [activePage, setActivePage] = useState(
    localStorage.getItem("admin_active_page") || "dashboard"
  );

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    localStorage.setItem("admin_active_page", page);
  };

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50">
      <Sidebar activePage={activePage} onMenuClick={handleMenuClick} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "employer-enquiries" && <EmployerEnquiriesPage />}
          {activePage === "employers" && <EmployersPage />}
          {activePage === "employees" && <EmployeesPage />}
          {activePage === "salary-requests" && <SalaryRequestsPage />}
          {activePage === "disbursals" && <DisbursalsPage />}
          {activePage === "repayments" && <RepaymentsPage />}
        </main>
      </div>
    </div>
  );
}
