import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Crown, Loader2, X } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { processDisbursal } from "../../services/disbursalService";
import type { Disbursal } from "../../types/disbursal";
import { ConfirmModal } from "../ui/ConfirmModal";

interface Props {
  open: boolean;
  disbursal: Disbursal | null;
  onClose: () => void;
  onMutated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700",
  DISBURSED: "bg-[#DCFCE7] text-[#15803D]",
  FAILED:    "bg-red-50 text-red-600",
};

const fmt = (v: string | null | undefined) =>
  v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

export default function DisbursalDrawer({ open, disbursal, onClose, onMutated }: Props) {
  useEscKey(open, onClose);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const disburseMutation = useMutation({
    mutationFn: () => processDisbursal(disbursal!.id),
    onSuccess: () => {
      toast.success("Disbursal processed", {
        description: `₹${Number(disbursal?.disbursedAmount).toLocaleString("en-IN")} sent to ${disbursal?.loanApplication.employee.name}.`,
      });
      onMutated();
      onClose();
    },
    onError: (err: unknown) => {
      toast.error("Disbursal failed", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !disbursal) return null;

  const emp = disbursal.loanApplication.employee;
  const awaitingMembership = disbursal.loanApplication.status === "AWAITING_MEMBERSHIP_PAYMENT";
  const canDisburse = disbursal.status === "PENDING" && !awaitingMembership;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-[#E5E7EB] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#111827] leading-none">{emp.name}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">{emp.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[disbursal.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {disbursal.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Disbursal details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Disbursal details</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Amount",       v: fmt(disbursal.disbursedAmount) },
                { k: "Status",       v: disbursal.status },
                { k: "Disbursed by", v: disbursal.disbursedBy ?? "System" },
                { k: "Disbursed on", v: disbursal.disbursedAt
                    ? new Date(disbursal.disbursedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—" },
                ...(disbursal.remarks ? [{ k: "Remarks", v: disbursal.remarks }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Employee</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Name",          v: emp.name },
                { k: "Employee code", v: <span className="font-mono">{emp.employeeCode}</span> },
                { k: "Email",         v: emp.email },
                { k: "Employer",      v: emp.employer.companyName },
                { k: "Company code",  v: <span className="font-mono">{emp.employer.companyCode}</span> },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Loan application */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Loan application</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Application No.",  v: <span className="font-mono text-[11px]">{disbursal.loanApplication.applicationNumber}</span> },
                { k: "Requested amount", v: fmt(disbursal.loanApplication.requestedAmount) },
                { k: "Approved amount",  v: fmt(disbursal.loanApplication.adminApprovedAmount) },
                { k: "App status",       v: disbursal.loanApplication.status },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer — shown for PENDING disbursals */}
        {disbursal.status === "PENDING" && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0 space-y-2.5">
            {awaitingMembership && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                <Crown size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-[600] text-amber-800 leading-none mb-0.5">Membership required</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">Employee must activate their membership before funds can be disbursed.</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canDisburse || disburseMutation.isPending}
              className="w-full h-8 rounded-md bg-[#315eff] hover:bg-[#2048EE] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {disburseMutation.isPending
                ? <Loader2 size={12} className="animate-spin" />
                : <CreditCard size={12} />}
              {disburseMutation.isPending ? "Processing…" : `Disburse ${fmt(disbursal.disbursedAmount)}`}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Disburse funds"
        description={`This will send ${fmt(disbursal.disbursedAmount)} to ${disbursal.loanApplication.employee.name}'s bank account. This cannot be undone.`}
        confirmLabel="Disburse"
        confirmClass="bg-[#315eff] hover:bg-[#2048EE] text-white"
        loading={disburseMutation.isPending}
        onConfirm={() => { setConfirmOpen(false); disburseMutation.mutate(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
