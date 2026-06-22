import { useEscKey } from "../../lib/useEscKey";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2, CreditCard, XCircle } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import {
  verifyBankAccount,
  rejectBankAccount,
  getBankAccountsByEmployer,
} from "../../services/bankVerificationService";
import type { BankAccount, BankEmployerGroup } from "../../types/bankAccount";

interface Props {
  open: boolean;
  group: BankEmployerGroup | null;
  queryKey: unknown[];
  onClose: () => void;
}

const AVATAR_COLORS: Record<string, string> = {
  A:"bg-rose-500", B:"bg-pink-500", C:"bg-fuchsia-500", D:"bg-[#ECEBFF]0",
  E:"bg-indigo-500", F:"bg-violet-500", G:"bg-purple-500", H:"bg-sky-500",
  I:"bg-cyan-500", J:"bg-[#7679FF]", K:"bg-[#7679FF]", L:"bg-[#ECEBFF]0",
  M:"bg-lime-500", N:"bg-yellow-500", O:"bg-amber-500", P:"bg-orange-500",
  Q:"bg-red-500", R:"bg-rose-600", S:"bg-pink-600", T:"bg-fuchsia-600",
  U:"bg-[#7679FF]", V:"bg-indigo-600", W:"bg-violet-600", X:"bg-[#7679FF]",
  Y:"bg-sky-600", Z:"bg-cyan-600",
};

function AccountRow({
  account,
  employerId,
  employerName,
  queryKey: qk,
}: {
  account: BankAccount;
  employerId: string;
  employerName: string;
  queryKey: unknown[];
}) {
  const qc = useQueryClient();

  const invalidateAll = () => {
    // Invalidate both the page-level grouped list AND the drawer's drill-down cache
    void qc.invalidateQueries({ queryKey: qk });
    void qc.invalidateQueries({ queryKey: ["bank-accounts-employer", employerId] });
  };

  const verifyMutation = useMutation({
    mutationFn: () => verifyBankAccount(account.id),
    onSuccess: () => {
      toast.success("Bank account verified", {
        description: `${account.employee.name}'s bank account at ${employerName} has been verified.`,
      });
      invalidateAll();
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: getApiErrorMessage(err) });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectBankAccount(account.id),
    onSuccess: () => {
      toast.success("Bank account rejected", {
        description: `${account.employee.name}'s bank account has been rejected.`,
      });
      invalidateAll();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: getApiErrorMessage(err) });
    },
  });

  const first = account.employee.name.charAt(0).toUpperCase();
  const av    = AVATAR_COLORS[first] ?? "bg-[#F7F7FB]0";

  return (
    <div className={`border rounded-xl overflow-hidden ${account.verified ? "border-[#E4E4EF]" : "border-[#E4E4EF]"}`}>
      {/* Employee header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F7F7FB]/60 border-b border-[#E4E4EF]">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${av} text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]`}>
            {first}
          </div>
          <div>
            <span className="text-[12px] font-[600] text-[#191A2E]">{account.employee.name}</span>
            <span className="text-[11px] text-[#62657A] font-mono ml-2">{account.employee.employeeCode}</span>
          </div>
        </div>
        {account.verified ? (
          <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[11px] font-[500] bg-[#EBF6E3] text-[#3B6D11]/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E8A18]" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[11px] font-[500] bg-amber-50/80 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        )}
      </div>

      {/* Bank details */}
      <div className="px-4 divide-y divide-[#F0F0F8]">
        {[
          { k: "Holder",  v: account.accountHolderName },
          { k: "Bank",    v: account.bankName ?? "—" },
          { k: "Account", v: <span className="font-mono">{account.accountNumber}</span> },
          { k: "IFSC",    v: <span className="font-mono">{account.ifscCode}</span> },
          ...(account.upiId ? [{ k: "UPI ID", v: account.upiId }] : []),
          { k: "Added",   v: new Date(account.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
        ].map(({ k, v }) => (
          <div key={k} className="flex items-center justify-between py-2">
            <span className="text-[11px] text-[#62657A]">{k}</span>
            <span className="text-[11px] font-[500] text-[#191A2E] text-right max-w-[60%] truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Verify / Reject actions */}
      {!account.verified && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending || rejectMutation.isPending}
            className="h-7 rounded-md bg-[#191A2E] hover:bg-[#2A2C45] text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {verifyMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />}
            {verifyMutation.isPending ? "Verifying…" : "Verify"}
          </button>
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={verifyMutation.isPending || rejectMutation.isPending}
            className="h-7 rounded-md bg-red-600 hover:bg-red-700 text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {rejectMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            {rejectMutation.isPending ? "Rejecting…" : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BankGroupedDrawer({ open, group, queryKey, onClose }: Props) {
  useEscKey(open, onClose);
  // Drill-down: fetch per-employer accounts when drawer is open.
  // Falls back to group.accounts if dedicated endpoint returns empty.
  const { data: drillAccounts, isLoading: drillLoading } = useQuery<BankAccount[]>({
    queryKey: ["bank-accounts-employer", group?.employerId],
    queryFn: () => getBankAccountsByEmployer(group!.employerId),
    enabled: open && !!group?.employerId,
    staleTime: 30_000,
  });

  if (!open || !group) return null;

  const first = group.companyName.charAt(0).toUpperCase();
  const av    = AVATAR_COLORS[first] ?? "bg-[#F7F7FB]0";

  // Prefer fresh drill-down data; fall back to pre-loaded group.accounts
  const rawAccounts: BankAccount[] =
    drillAccounts && drillAccounts.length > 0 ? drillAccounts : (group.accounts ?? []);

  const pendingAccounts  = rawAccounts.filter(a => !a.verified);
  const verifiedAccounts = rawAccounts.filter(a => a.verified);

  // Show pending first
  const sorted: BankAccount[] = [...pendingAccounts, ...verifiedAccounts];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-[#E4E4EF] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E4EF] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${av} text-white flex items-center justify-center text-[12px] font-[600]`}>
              {first}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-[#191A2E] leading-none">{group.companyName}</p>
              <p className="text-[11px] text-[#62657A] mt-0.5 leading-none font-mono">{group.companyCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-[500]">
              {group.pendingCount > 0 && (
                <span className="text-amber-600 font-[600]">{group.pendingCount} pending</span>
              )}
              {group.verifiedCount > 0 && (
                <span className="text-[#7679FF] font-[600]">{group.verifiedCount} verified</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[#62657A] hover:text-[#62657A] hover:bg-[#F0F0F8] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {drillLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="border border-[#E4E4EF] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#F7F7FB] border-b border-[#E4E4EF]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#E4E4EF] animate-pulse" />
                    <div className="h-2.5 w-28 bg-[#E4E4EF] rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-14 bg-[#E4E4EF] rounded-full animate-pulse" />
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-2 w-12 bg-[#F0F0F8] rounded animate-pulse" />
                      <div className="h-2 w-24 bg-[#F0F0F8] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-[#62657A] font-[500]">No bank accounts</p>
              <p className="text-[12px] text-[#62657A] mt-1">No employees from this employer have added bank accounts yet.</p>
            </div>
          ) : (
            sorted.map(a => (
              <AccountRow
                key={a.id}
                account={a}
                employerId={group.employerId}
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
