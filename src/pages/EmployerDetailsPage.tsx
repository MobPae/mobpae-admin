import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

type EmployerStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "DISCONTINUED";

type Employee = {
  id: string;
  employeeCode?: string;
  name: string;
  email: string;
  phone?: string | null;
  salaryInHand?: number;
  preApprovedLimit?: number;
  appActivationStatus?: string;
  isActive?: boolean;
  createdAt?: string;
};

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
  employees?: Employee[];
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
  const [employeeSearch, setEmployeeSearch] = useState("");
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

  function formatAmount(value?: number) {
    if (!value) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getStatusClass(status?: EmployerStatus) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "INACTIVE":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "PAUSED":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "DISCONTINUED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  function getActivationClass(status?: string) {
    const value = status?.toUpperCase();

    if (value === "ACTIVE" || value === "ACTIVATED") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (value === "PENDING") {
      return "bg-amber-50 text-amber-700";
    }

    if (value === "BLOCKED" || value === "INACTIVE") {
      return "bg-red-50 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  useEffect(() => {
    fetchEmployer();
  }, [id]);

  const employees = employer?.employees || [];

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.toLowerCase().trim();

    if (!keyword) return employees;

    return employees.filter((employee) => {
      const value =
        `${employee.name} ${employee.email} ${employee.phone} ${employee.employeeCode} ${employee.appActivationStatus}`.toLowerCase();

      return value.includes(keyword);
    });
  }, [employees, employeeSearch]);

  const activeEmployees = employees.filter(
    (employee) =>
      employee.isActive ||
      employee.appActivationStatus === "ACTIVE" ||
      employee.appActivationStatus === "ACTIVATED"
  ).length;

  const pendingActivations = employees.filter(
    (employee) =>
      employee.appActivationStatus === "PENDING" ||
      !employee.appActivationStatus
  ).length;

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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Building2 size={24} />
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-primary">Employer</p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {employer.companyName}
              </h2>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>{employer.companyEmail || "-"}</span>
                <span>{employer.companyPhone || "-"}</span>
                <span>
                  Created:{" "}
                  {employer.createdAt
                    ? new Date(employer.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
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
        <SummaryCard
          icon={<Users size={22} />}
          label="Total Employees"
          value={employees.length}
        />
        <SummaryCard
          icon={<UserCheck size={22} />}
          label="Active Employees"
          value={activeEmployees}
        />
        <SummaryCard
          icon={<ShieldCheck size={22} />}
          label="Pending Activations"
          value={pendingActivations}
        />
        <SummaryCard
          icon={<IndianRupee size={22} />}
          label="Advance Requests"
          value={employer.advanceRequests?.length || 0}
        />
      </section>

      <section className="overflow-hidden rounded-[1.5rem] bg-white shadow-soft">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Employees</h3>
            <p className="mt-1 text-sm text-slate-500">
              Read-only employee list for admin review.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={17}
            />
            <input
              value={employeeSearch}
              onChange={(event) => setEmployeeSearch(event.target.value)}
              placeholder="Search employee..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Activation</th>
                <th className="px-5 py-4">Salary In Hand</th>
                <th className="px-5 py-4">Pre-approved Limit</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Employee Code</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {employee.name || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Added:{" "}
                        {employee.createdAt
                          ? new Date(employee.createdAt).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getActivationClass(
                        employee.appActivationStatus
                      )}`}
                    >
                      {employee.appActivationStatus || "PENDING"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {formatAmount(employee.salaryInHand)}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {formatAmount(employee.preApprovedLimit)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="grid gap-1 text-slate-600">
                      <span>{employee.email || "-"}</span>
                      <span>{employee.phone || "-"}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {employee.employeeCode || "-"}
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
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
