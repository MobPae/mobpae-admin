import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

type EmployerStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "DISCONTINUED";

type Employer = {
  id: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  status?: EmployerStatus;
  appActivationRequired?: boolean;
  gstNumber?: string | null;
  panNumber?: string | null;
  cinNumber?: string | null;
  registeredAddress?: string | null;
  validationNotes?: string | null;
  employees?: unknown[];
  advanceRequests?: unknown[];
  createdAt?: string;
};

export function EmployerDetailsPage() {
  const { id } = useParams();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  async function fetchEmployer() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/employers/${id}`);
      setEmployer(response.data?.data || response.data);
    } catch {
      setError("Unable to load employer details");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: EmployerStatus) {
    if (!employer) return;

    const confirmUpdate = window.confirm(
      `Change employer status to ${status}?`
    );

    if (!confirmUpdate) return;

    setUpdatingStatus(true);

    try {
      const response = await api.patch(`/employers/${employer.id}/status`, {
        status,
      });

      setEmployer(response.data?.data || response.data);
    } catch {
      alert("Unable to update employer status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  useEffect(() => {
    fetchEmployer();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
        Loading employer details...
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error || "Employer not found"}
      </div>
    );
  }

  const status = employer.status || "ACTIVE";

  return (
    <div className="space-y-6">
      <Link
        to="/employers"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Employers
      </Link>

      <section className="rounded-[2rem] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Building2 size={24} />
            </span>

            <div>
              <p className="text-sm font-semibold text-primary">Employer</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {employer.companyName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Company ID: {employer.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              disabled={updatingStatus}
              onChange={(event) =>
                updateStatus(event.target.value as EmployerStatus)
              }
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 outline-none disabled:opacity-60"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="DISCONTINUED">DISCONTINUED</option>
            </select>

            {updatingStatus && (
              <Loader2 className="animate-spin text-primary" size={18} />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <Users className="text-primary" size={22} />
          <p className="mt-4 text-sm text-slate-500">Employees Added</p>
          <h3 className="mt-1 text-2xl font-bold">
            {employer.employees?.length || 0}
          </h3>
        </div>

        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <ShieldCheck className="text-primary" size={22} />
          <p className="mt-4 text-sm text-slate-500">App Activation</p>
          <h3 className="mt-1 text-lg font-bold">
            {employer.appActivationRequired ? "Required" : "Not Required"}
          </h3>
        </div>

        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <Calendar className="text-primary" size={22} />
          <p className="mt-4 text-sm text-slate-500">Created</p>
          <h3 className="mt-1 text-lg font-bold">
            {employer.createdAt
              ? new Date(employer.createdAt).toLocaleDateString()
              : "-"}
          </h3>
        </div>

        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <Building2 className="text-primary" size={22} />
          <p className="mt-4 text-sm text-slate-500">Advance Requests</p>
          <h3 className="mt-1 text-2xl font-bold">
            {employer.advanceRequests?.length || 0}
          </h3>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold">Company Information</h3>

          <div className="mt-5 grid gap-4 text-sm">
            <Info label="Company Name" value={employer.companyName} />
            <Info label="GST Number" value={employer.gstNumber || "-"} />
            <Info label="PAN Number" value={employer.panNumber || "-"} />
            <Info label="CIN Number" value={employer.cinNumber || "-"} />
            <Info
              label="Registered Address"
              value={employer.registeredAddress || "-"}
            />
            <Info
              label="Validation Notes"
              value={employer.validationNotes || "-"}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold">Contact Details</h3>

          <div className="mt-5 grid gap-4 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Mail size={18} className="text-primary" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Email</p>
                <p className="font-semibold text-slate-800">
                  {employer.companyEmail || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Phone size={18} className="text-primary" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Phone</p>
                <p className="font-semibold text-slate-800">
                  {employer.companyPhone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
