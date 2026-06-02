import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import DashboardPage from "../pages/DashboardPage";

export default function AdminLayout() {
  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
