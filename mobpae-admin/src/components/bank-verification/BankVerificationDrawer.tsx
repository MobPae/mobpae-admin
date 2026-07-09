import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2, CreditCard } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { verifyBankAccount } from "../../services/bankVerificationService";
import type { BankAccount } from "../../types/bankAccount";

interface Props {
  open: boolean;
  account: BankAccount | null;
  onClose: () => void;
  onCompleted: () => void;
}

export default function BankVerificationDrawer({ open, account, onClose, onCompleted }: Props) {
  const verifyMutation = useMutation({
    mutationFn: () => verifyBankAccount(account!.id),
    onSuccess: () => {
      toast.success("Bank account verified", {
        description: `${account?.employee.name}'s bank account has been verified.`,
      });
      onCompleted();
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !account) return null;

  const isBusy = verifyMutation.isPending;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-[#E5E7EB] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {account.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#111827] leading-none">{account.employee.name}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">{account.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${account.verified ? "bg-[#DCFCE7] text-[#15803D]" : "bg-amber-50 text-amber-700"}`}>
              {account.verified ? "Verified" : "Pending"}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Bank account details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-[#6B7280] mb-2">Bank account</p>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
              {[
                { k: "Account holder",  v: account.accountHolderName },
                { k: "Bank name",       v: account.bankName ?? "—" },
                { k: "Account number",  v: <span className="font-mono">{account.accountNumber}</span> },
                { k: "IFSC code",       v: <span className="font-mono">{account.ifscCode}</span> },
                ...(account.upiId ? [{ k: "UPI ID", v: account.upiId }] : []),
                { k: "Added on",        v: new Date(account.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
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
                { k: "Name",            v: account.employee.name },
                { k: "Employee code",   v: <span className="font-mono">{account.employee.employeeCode}</span> },
                { k: "Email",           v: account.employee.email },
                { k: "Employer",        v: account.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-[#6B7280]">{k}</span>
                  <span className="text-[11px] font-[500] text-[#111827] text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {account.verified && (
            <div className="bg-[#EEF2FF] rounded-md px-3 py-2.5 border border-[#EEF2FF]">
              <p className="text-[11px] text-[#2048EE]">This bank account has already been verified.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!account.verified && (
          <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex-shrink-0">
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={isBusy}
              className="w-full h-8 rounded-md bg-[#111827] hover:bg-[#2A2C45] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
              {isBusy ? "Verifying…" : "Verify bank account"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
