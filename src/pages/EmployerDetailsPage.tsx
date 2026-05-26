import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Users,
  X,
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

type EmployerForm = {
  companyName: string;
  companyPhone: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  registeredAddress: string;
  validationNotes: string;
  appActivationRequired: boolean;
};

export function EmployerDetailsPage() {
  const { id } = useParams();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [form, setForm] = useState<EmployerForm>({
    companyName: "",
    companyPhone: "",
    gstNumber: "",
    panNumber: "",
    cinNumber: "",
    registeredAddress: "",
    validationNotes: "",
    appActivationRequired: true,
  });
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  function syncForm(data: Employer) {
    setForm({
      companyName: data.companyName || "",
      companyPhone: data.companyPhone || "",
      gstNumber: data.gstNumber || "",
      panNumber: data.panNumber || "",
      cinNumber: data.cinNumber || "",
      registeredAddress: data.registeredAddress || "",
      validationNotes: data.validationNotes || "",
      appActivationRequired: data.appActivationRequired ?? true,
    });
  }

  async function fetchEmployer() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/employers/${id}`);
      const data = response.data?.data || response.data;

      setEmployer(data);
      syncForm(data);
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

      const updated = response.data?.data || response.data;
      setEmployer((current) => ({ ...(current as Employer), ...updated }));
    } catch {
      alert("Unable to update employer status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function saveEmployer() {
    if (!employer) return;

    setSaving(true);

    try {
      const response = await api.patch(`/employers/${employer.id}`, {
        companyName: form.companyName,
        companyPhone: form.companyPhone || null,
        gstNumber: form.gstNumber || null,
        panNumber: form.panNumber || null,
        cinNumber: form.cinNumber || null,
        registeredAddress: form.registeredAddress || null,
        validationNotes: form.validationNotes || null,
        appActivationRequired: form.appActivationRequired,
      });

      const updated = response.data?.data || response.data;

      setEmployer((current) => ({ ...(current as Employer), ...updated }));
      syncForm({ ...(employer as Employer), ...updated });
      setEditing(false);
      alert("Employer updated successfully");
    } catch {
      alert("Unable to update employer details");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (employer) syncForm(employer);
    setEditing(false);
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

          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Edit3 size={14} />
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={saveEmployer}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={14} />
                  Cancel
                </button>
              </>
            )}

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
            {editing ? (
              <>
                <Field
                  label="Company Name"
                  value={form.companyName}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, companyName: value }))
                  }
                />
                <Field
                  label="GST Number"
                  value={form.gstNumber}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, gstNumber: value }))
                  }
                />
                <Field
                  label="PAN Number"
                  value={form.panNumber}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, panNumber: value }))
                  }
                />
                <Field
                  label="CIN Number"
                  value={form.cinNumber}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, cinNumber: value }))
                  }
                />
                <TextArea
                  label="Registered Address"
                  value={form.registeredAddress}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      registeredAddress: value,
                    }))
                  }
                />
                <TextArea
                  label="Validation Notes"
                  value={form.validationNotes}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      validationNotes: value,
                    }))
                  }
                />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold">Contact & Activation</h3>

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

            {editing ? (
              <>
                <Field
                  label="Phone"
                  value={form.companyPhone}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, companyPhone: value }))
                  }
                />

                <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span>
                    <span className="block text-xs font-semibold text-slate-500">
                      App Activation Required
                    </span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Enable if employees need app activation
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.appActivationRequired}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        appActivationRequired: event.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                </label>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <Phone size={18} className="text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Phone
                    </p>
                    <p className="font-semibold text-slate-800">
                      {employer.companyPhone || "-"}
                    </p>
                  </div>
                </div>

                <Info
                  label="App Activation Required"
                  value={employer.appActivationRequired ? "Yes" : "No"}
                />
              </>
            )}
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl bg-slate-50 p-4">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl bg-slate-50 p-4">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary"
      />
    </label>
  );
}
