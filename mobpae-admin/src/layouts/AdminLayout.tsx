import { useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import DashboardPage from "../pages/DashboardPage";
import EmployerEnquiriesPage from "../pages/EmployerEnquiriesPage";
import EmployersPage from "../pages/EmployersPage";

export default function AdminLayout() {
  // const [activePage, setActivePage] = useState("dashboard");
  const [activePage, setActivePage] = useState(
    localStorage.getItem("admin_active_page") || "dashboard"
  );

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    localStorage.setItem("admin_active_page", page);
  };

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar activePage={activePage} onMenuClick={handleMenuClick} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "employer-enquiries" && <EmployerEnquiriesPage />}
          {activePage === "employers" && <EmployersPage />}
        </main>
      </div>
    </div>
  );
}
