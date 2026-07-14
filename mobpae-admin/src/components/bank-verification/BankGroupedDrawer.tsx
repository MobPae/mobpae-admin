import { useState } from "react";
import { useEscKey } from "../../lib/useEscKey";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2, CreditCard, XCircle, Eye, EyeOff } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import {
  verifyBankAccount,
  rejectBankAccount,
  getBankAccountsByEmployer,
} from "../../services/bankVerificationService";
import type { BankAccount, BankEmployerGroup } from "../../types/bankAccount";
import { avatarColor } from "../../utils/avatarColor";

interface Props {
  open: boolean;
  group: BankEmployerGroup | null;
  queryKey: unknown[];
  onClose: () => void;
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return "•".repeat(num.length - 4) + num.slice(-4);
}

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

  const [revealAccount, setRevealAccount] = useState(false);
  const first = account.employee.name.charAt(0).toUpperCase();
  const av    = avatarColor(account.employee.name);

  return (
    <div className={`border rounded-xl overflow-hidden ${account.verified ? "border-edge" : "border-edge"}`}>
      {/* Employee header */}
      <div className="flex items-center justify-between px-4 py-3 bg-canvas/60 border-b border-edge">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg text-white flex-shrink-0 flex items-center justify-center text-[11px] font-[600]" style={{ background: av }}>
            {first}
          </div>
          <div>
            <span className="text-[12px] font-[600] text-ink">{account.employee.name}</span>
            <span className="text-[11px] text-ink-3 font-mono ml-2">{account.employee.employeeCode}</span>
          </div>
        </div>
        {account.verified ? (
          <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[11px] font-[500] bg-success-bg text-success-dark/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
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
      <div className="px-4 divide-y divide-edge-2">
        {[
          { k: "Holder",  v: account.accountHolderName },
          { k: "Bank",    v: account.bankName ?? "—" },
          {
            k: "Account",
            v: (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono">
                  {revealAccount ? account.accountNumber : maskAccountNumber(account.accountNumber)}
                </span>
                <button
                  type="button"
                  onClick={() => setRevealAccount(v => !v)}
                  className="text-ink-4 hover:text-ink-2 transition-colors"
                  title={revealAccount ? "Hide account number" : "Reveal account number"}
                >
                  {revealAccount ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
              </span>
            ),
          },
          { k: "IFSC",    v: <span className="font-mono">{account.ifscCode}</span> },
          ...(account.upiId ? [{ k: "UPI ID", v: account.upiId }] : []),
          { k: "Added",   v: new Date(account.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
        ].map(({ k, v }) => (
          <div key={k} className="flex items-center justify-between py-2">
            <span className="text-[11px] text-ink-3">{k}</span>
            <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Verify / Reject actions */}
      {!account.verified && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending || rejectMutation.isPending}
            className="h-7 rounded-md bg-[#111827] hover:bg-[#2A2C45] text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
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
  const av    = avatarColor(group.companyName);

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

      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-[12px] font-[600]" style={{ background: av }}>
              {first}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{group.companyName}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none font-mono">{group.companyCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-[500]">
              {group.pendingCount > 0 && (
                <span className="text-warning font-[600]">{group.pendingCount} pending</span>
              )}
              {group.verifiedCount > 0 && (
                <span className="text-brand font-[600]">{group.verifiedCount} verified</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {drillLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="border border-edge rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-canvas border-b border-edge">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-edge animate-pulse" />
                    <div className="h-2.5 w-28 bg-edge rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-14 bg-edge rounded-full animate-pulse" />
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-2 w-12 bg-surface-muted rounded animate-pulse" />
                      <div className="h-2 w-24 bg-surface-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-ink-3 font-[500]">No bank accounts</p>
              <p className="text-[12px] text-ink-3 mt-1">No employees from this employer have added bank accounts yet.</p>
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
