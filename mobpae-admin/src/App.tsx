import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import EmployerEnquiriesPage from "./pages/EmployerEnquiriesPage";
import EmployersPage from "./pages/EmployersPage";
import EmployeesPage from "./pages/EmployeesPage";
import SalaryRequestsPage from "./pages/SalaryRequestsPage";
import DisbursalsPage from "./pages/DisbursalsPage";
import RepaymentsPage from "./pages/RepaymentsPage";
import KycVerificationPage from "./pages/KycVerificationPage";
import BankVerificationPage from "./pages/BankVerificationPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all admin pages nested inside AdminLayout via Outlet */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employer-enquiries" element={<EmployerEnquiriesPage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="salary-requests" element={<SalaryRequestsPage />} />
          <Route path="disbursals" element={<DisbursalsPage />} />
          <Route path="repayments" element={<RepaymentsPage />} />
          <Route path="kyc" element={<KycVerificationPage />} />
          <Route path="bank-verification" element={<BankVerificationPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
