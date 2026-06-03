import { useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import DashboardPage from "../pages/DashboardPage";
import EmployerEnquiriesPage from "../pages/EmployerEnquiriesPage";

export default function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar activePage={activePage} onMenuClick={setActivePage} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          {activePage === "dashboard" && <DashboardPage />}

          {activePage === "employer-enquiries" && <EmployerEnquiriesPage />}
        </main>
      </div>
    </div>
  );
}
