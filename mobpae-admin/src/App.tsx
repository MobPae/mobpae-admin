import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EmployerEnquiriesPage = lazy(() => import("./pages/EmployerEnquiriesPage"));
const EmployersPage = lazy(() => import("./pages/EmployersPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const LoanApplicationsPage = lazy(() => import("./pages/LoanApplicationsPage"));
const DisbursalsPage = lazy(() => import("./pages/DisbursalsPage"));
const RecoveriesPage = lazy(() => import("./pages/RecoveriesPage"));
const RepaymentsPage = lazy(() => import("./pages/RepaymentsPage"));
const SettlementsPage = lazy(() => import("./pages/SettlementsPage"));
const MembershipsPage = lazy(() => import("./pages/MembershipsPage"));
const RevenuePage = lazy(() => import("./pages/RevenuePage"));
const KycVerificationPage = lazy(() => import("./pages/KycVerificationPage"));
const BankVerificationPage = lazy(() => import("./pages/BankVerificationPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const AppInformationPage = lazy(() => import("./pages/AppInformationPage").then(m => ({ default: m.AppInformationPage })));
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#F8F9FC] text-sm font-medium text-[#6B7280]">Loading workspace...</div>}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Semi-protected: needs token but outside main layout */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

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
          <Route path="loan-applications" element={<LoanApplicationsPage />} />
          <Route path="disbursals" element={<DisbursalsPage />} />
          <Route path="recoveries" element={<RecoveriesPage />} />
          <Route path="repayments" element={<RepaymentsPage />} />
          <Route path="settlements" element={<SettlementsPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="kyc" element={<KycVerificationPage />} />
          <Route path="bank-verification" element={<BankVerificationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="app-information" element={<AppInformationPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
