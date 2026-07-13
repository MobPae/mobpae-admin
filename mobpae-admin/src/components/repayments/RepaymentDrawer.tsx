import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { markRepaymentPaid } from "../../services/repaymentService";
import type { Repayment } from "../../types/repayment";
import { ConfirmModal } from "../ui/ConfirmModal";

interface Props {
  open: boolean;
  repayment: Repayment | null;
  onClose: () => void;
  onMutated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-warning-bg text-warning-dark",
  PAID:      "bg-success-bg text-success-dark",
  OVERDUE:   "bg-danger-soft text-danger",
};

const fmt = (v: string) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function RepaymentDrawer({ open, repayment, onClose, onMutated }: Props) {
  useEscKey(open, onClose);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const markPaidMutation = useMutation({
    mutationFn: () => markRepaymentPaid(repayment!.id),
    onSuccess: () => {
      toast.success("Repayment marked as paid", {
        description: `${fmt(repayment!.totalAmount)} recovered from ${repayment!.loanApplication.employee.name}.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Failed to mark paid", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !repayment) return null;

  const emp = repayment.loanApplication.employee;
  const canMarkPaid = repayment.status === "SCHEDULED" || repayment.status === "OVERDUE";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{emp.name}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{emp.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[repayment.status] ?? "bg-surface-muted text-ink-3"}`}>
              {repayment.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Repayment details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Repayment details</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Principal amount", v: fmt(repayment.principalAmount) },
                { k: "Interest amount",  v: fmt(repayment.interestAmount)  },
                { k: "Total amount",     v: fmt(repayment.totalAmount)     },
                { k: "Interest rate",    v: `${repayment.interestRate}%`   },
                { k: "Interest days",    v: `${repayment.interestDays} days` },
                { k: "Due date",         v: new Date(repayment.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(repayment.paidDate ? [{ k: "Paid on", v: new Date(repayment.paidDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(repayment.remarks ? [{ k: "Remarks", v: repayment.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Employee</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Name",          v: emp.name },
                { k: "Employee code", v: <span className="font-mono">{emp.employeeCode}</span> },
                { k: "Email",         v: emp.email },
                { k: "Employer",      v: emp.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Original loan application */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Loan application</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Application ID",  v: <span className="font-mono text-[11px]">{repayment.loanApplicationId}</span> },
                { k: "Advance amount",  v: fmt(repayment.loanApplication.requestedAmount) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer — Mark Paid action */}
        {canMarkPaid && (
          <div className="border-t border-edge px-5 py-3.5 flex-shrink-0">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={markPaidMutation.isPending}
              className="w-full h-8 rounded-md bg-brand hover:bg-[#2048EE] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {markPaidMutation.isPending
                ? <Loader2 size={12} className="animate-spin" />
                : <CheckCircle2 size={12} />}
              {markPaidMutation.isPending ? "Processing…" : `Mark Paid · ${fmt(repayment.totalAmount)}`}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Mark repayment as paid"
        description={`This will record ${fmt(repayment.totalAmount)} from ${repayment.loanApplication.employee.name} as received. This cannot be undone.`}
        confirmLabel="Mark Paid"
        confirmClass="bg-brand hover:bg-[#2048EE] text-white"
        loading={markPaidMutation.isPending}
        onConfirm={() => { setConfirmOpen(false); markPaidMutation.mutate(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
