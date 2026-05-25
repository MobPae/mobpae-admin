import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { DisbursalsPage } from "./pages/DisbursalsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EmployersPage } from "./pages/EmployersPage";
import { EnquiriesPage } from "./pages/EnquiriesPage";
import { LoginPage } from "./pages/LoginPage";
import { RepaymentsPage } from "./pages/RepaymentsPage";
import { RequestsPage } from "./pages/RequestsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="disbursals" element={<DisbursalsPage />} />
          <Route path="repayments" element={<RepaymentsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
