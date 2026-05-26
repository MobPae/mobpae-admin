import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { DisbursalsPage } from "./pages/DisbursalsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EmployersPage } from "./pages/EmployersPage";
import { EnquiriesPage } from "./pages/EnquiriesPage";
import { LoginPage } from "./pages/LoginPage";
import { RepaymentsPage } from "./pages/RepaymentsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { isLoggedIn } from "./services/auth";
import { EmployerDetailsPage } from "./pages/EmployerDetailsPage";
import { RequestDetailsPage } from "./pages/RequestDetailsPage";
import { RepaymentDetailsPage } from "./pages/RepaymentDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

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
          <Route path="employers" element={<EmployersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="disbursals" element={<DisbursalsPage />} />
          <Route path="repayments" element={<RepaymentsPage />} />
          <Route path="/repayments/:id" element={<RepaymentDetailsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="/employers/:id" element={<EmployerDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
