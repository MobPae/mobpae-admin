import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { verifyBankAccount } from "../../services/bankVerificationService";
import type { BankAccount, BankEmployerGroup } from "../../types/bankAccount";

interface Props {
  open: boolean;
  group: BankEmployerGroup | null;
  queryKey: unknown[];
  onClose: () => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500", B:"bg-pink-500", C:"bg-fuchsia-500", D:"bg-blue-500",
  E:"bg-indigo-500", F:"bg-violet-500", G:"bg-purple-500", H:"bg-sky-500",
  I:"bg-cyan-500", J:"bg-teal-500", K:"bg-emerald-500", L:"bg-green-500",
  M:"bg-lime-500", N:"bg-yellow-500", O:"bg-amber-500", P:"bg-orange-500",
  Q:"bg-red-500", R:"bg-rose-600", S:"bg-pink-600", T:"bg-fuchsia-600",
  U:"bg-blue-600", V:"bg-indigo-600", W:"bg-violet-600", X:"bg-blue-600",
  Y:"bg-sky-600", Z:"bg-cyan-600",
};

function AccountRow({
  account,
  employerName,
  queryKey: qk,
}: {
  account: BankAccount;
  employerName: string;
  queryKey: unknown[];
}) {
  const qc = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: () => verifyBankAccount(account.id),
    onSuccess: () => {
      toast.success("Bank account verified", {
        description: `${account.employee.name}'s bank account at ${employerName} has been verified.`,
      });
      void qc.invalidateQueries({ queryKey: qk });
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: getApiErrorMessage(err) });
    },
  });

  const first = account.employee.name.charAt(0).toUpperCase();
  const av    = AVATAR_COLORS[first] ?? "bg-slate-500";

  return (
    <div className={`border rounded-xl overflow-hidden ${account.verified ? "border-slate-100" : "border-slate-200"}`}>
      {/* Employee header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[10px] font-[600]`}>
            {first}
          </div>
          <div>
            <span className="text-[12px] font-[600] text-slate-900">{account.employee.name}</span>
            <span className="text-[10px] text-slate-400 font-mono ml-2">{account.employee.employeeCode}</span>
          </div>
        </div>
        {account.verified ? (
          <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-[500] bg-emerald-50/80 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-[500] bg-amber-50/80 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        )}
      </div>

      {/* Bank details */}
      <div className="px-4 divide-y divide-slate-50">
        {[
          { k: "Holder",  v: account.accountHolderName },
          { k: "Bank",    v: account.bankName ?? "—" },
          { k: "Account", v: <span className="font-mono">{account.accountNumber}</span> },
          { k: "IFSC",    v: <span className="font-mono">{account.ifscCode}</span> },
          ...(account.upiId ? [{ k: "UPI ID", v: account.upiId }] : []),
          { k: "Added",   v: new Date(account.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
        ].map(({ k, v }) => (
          <div key={k} className="flex items-center justify-between py-2">
            <span className="text-[11px] text-slate-400">{k}</span>
            <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Verify action */}
      {!account.verified && (
        <div className="px-4 pb-3">
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className="w-full h-7 mt-1 rounded-md bg-slate-900 hover:bg-slate-700 text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {verifyMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />}
            {verifyMutation.isPending ? "Verifying…" : "Verify account"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BankGroupedDrawer({ open, group, queryKey, onClose }: Props) {
  if (!open || !group) return null;

  const first = group.companyName.charAt(0).toUpperCase();
  const av    = AVATAR_COLORS[first] ?? "bg-slate-500";

  const pendingAccounts  = group.accounts.filter(a => !a.verified);
  const verifiedAccounts = group.accounts.filter(a => a.verified);

  // Show pending first
  const sorted: BankAccount[] = [...pendingAccounts, ...verifiedAccounts];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${av} text-white flex items-center justify-center text-[12px] font-[600]`}>
              {first}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{group.companyName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none font-mono">{group.companyCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-[500]">
              {group.pendingCount > 0 && (
                <span className="text-amber-600 font-[600]">{group.pendingCount} pending</span>
              )}
              {group.verifiedCount > 0 && (
                <span className="text-emerald-600 font-[600]">{group.verifiedCount} verified</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {sorted.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-slate-500 font-[500]">No bank accounts</p>
              <p className="text-[12px] text-slate-400 mt-1">No employees from this employer have added bank accounts yet.</p>
            </div>
          ) : (
            sorted.map(a => (
              <AccountRow
                key={a.id}
                account={a}
                employerName={group.companyName}
                queryKey={queryKey}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
