import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  IndianRupee,
  Mail,
  Phone,
  ReceiptText,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

type RepaymentStatus = "PENDING" | "PAID" | "OVERDUE";
type DisbursalStatus = "PENDING" | "DISBURSED" | "FAILED";

type Repayment = {
  id: string;
  status: RepaymentStatus;
  amount: number;
  dueDate?: string;
  paidAt?: string | null;
  paymentRef?: string | null;
  createdAt?: string;
  advanceRequest?: {
    id: string;
    amount: number;
    status: string;
    employerRemarks?: string | null;
    requestMonth?: number;
    requestYear?: number;
    employee?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      employeeCode?: string;
      salaryInHand?: number;
      availableLimit?: number;
    };
    employer?: {
      id: string;
      companyName: string;
      companyEmail?: string;
      companyPhone?: string;
    };
    disbursal?: {
      id: string;
      status: DisbursalStatus;
      amount?: number;
      transactionRef?: string | null;
      adminRemarks?: string | null;
      disbursedAt?: string | null;
    } | null;
  };
};

export function RepaymentDetailsPage() {
  const { id } = useParams();
  const [repayment, setRepayment] = useState<Repayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchRepayment() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/repayments/${id}`);
      const data = response.data?.data || response.data;
      setRepayment(data);
    } catch {
      setError("Unable to load repayment details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRepayment();
  }, [id]);

  function formatAmount(value?: number) {
    if (!value) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  function statusClass(status?: string) {
    if (status === "PAID" || status === "DISBURSED" || status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "PENDING") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }

    if (status === "OVERDUE" || status === "FAILED" || status === "REJECTED") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  if (loading) {
    return (
      <div className="rounded-[1.5rem] bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">
        Loading repayment details...
      </div>
    );
  }

  if (error || !repayment) {
    return (
      <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error || "Repayment not found"}
      </div>
    );
  }

  const request = repayment.advanceRequest;

  return (
    <div className="space-y-6">
      <Link
        to="/repayments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Repayments
      </Link>

      <section className="rounded-[2rem] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <ReceiptText size={24} />
            </span>

            <div>
              <p className="text-sm font-semibold text-primary">
                Repayment Details
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatAmount(repayment.amount)}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Repayment ID: {repayment.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={repayment.status}
              className={statusClass(repayment.status)}
            />
            <StatusBadge
              label={request?.status || "NO REQUEST"}
              className={statusClass(request?.status)}
            />
            <StatusBadge
              label={request?.disbursal?.status || "NO DISBURSAL"}
              className={statusClass(request?.disbursal?.status)}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={<IndianRupee size={22} />}
          label="Repayment Amount"
          value={formatAmount(repayment.amount)}
        />
        <SummaryCard
          icon={<Calendar size={22} />}
          label="Due Date"
          value={formatDate(repayment.dueDate)}
        />
        <SummaryCard
          icon={<Calendar size={22} />}
          label="Paid At"
          value={formatDate(repayment.paidAt)}
        />
        <SummaryCard
          icon={<IndianRupee size={22} />}
          label="Request Amount"
          value={formatAmount(request?.amount)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Employee Details" icon={<User size={20} />}>
          <Info label="Name" value={request?.employee?.name || "-"} />
          <Info label="Email" value={request?.employee?.email || "-"} />
          <Info label="Phone" value={request?.employee?.phone || "-"} />
          <Info
            label="Employee Code"
            value={request?.employee?.employeeCode || "-"}
          />
          <Info
            label="Salary In Hand"
            value={formatAmount(request?.employee?.salaryInHand)}
          />
          <Info
            label="Available Limit"
            value={formatAmount(request?.employee?.availableLimit)}
          />
        </InfoCard>

        <InfoCard title="Employer Details" icon={<Building2 size={20} />}>
          <Info label="Company" value={request?.employer?.companyName || "-"} />
          <Info label="Email" value={request?.employer?.companyEmail || "-"} />
          <Info label="Phone" value={request?.employer?.companyPhone || "-"} />
          <Info label="Employer ID" value={request?.employer?.id || "-"} />
        </InfoCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Advance Request" icon={<ReceiptText size={20} />}>
          <Info label="Request ID" value={request?.id || "-"} />
          <Info label="Status" value={request?.status || "-"} />
          <Info
            label="Request Month"
            value={
              request?.requestMonth && request?.requestYear
                ? `${request.requestMonth}/${request.requestYear}`
                : "-"
            }
          />
          <Info label="Remarks" value={request?.employerRemarks || "-"} />
        </InfoCard>

        <InfoCard title="Disbursal Details" icon={<Mail size={20} />}>
          <Info label="Status" value={request?.disbursal?.status || "-"} />
          <Info
            label="Amount"
            value={formatAmount(request?.disbursal?.amount)}
          />
          <Info
            label="Transaction Ref"
            value={request?.disbursal?.transactionRef || "-"}
          />
          <Info
            label="Disbursed At"
            value={formatDate(request?.disbursal?.disbursedAt)}
          />
          <Info
            label="Admin Remarks"
            value={request?.disbursal?.adminRemarks || "-"}
          />
        </InfoCard>
      </section>

      <section className="rounded-[1.5rem] bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Phone size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-slate-900">Payment Tracking</h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Info label="Payment Ref" value={repayment.paymentRef || "-"} />
          <Info label="Repayment Status" value={repayment.status} />
          <Info label="Created At" value={formatDate(repayment.createdAt)} />
        </div>
      </section>
    </div>
  );
}

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-900">{value}</h3>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>

      <div className="mt-5 grid gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
    </div>
  );
}
