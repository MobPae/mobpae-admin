import { CheckCircle2, CreditCard, Loader2, X } from "lucide-react";
import { useState } from "react";
import type { BankAccount } from "../../types/bankAccount";
import { verifyBankAccount } from "../../services/bankVerificationService";

interface Props {
  open: boolean;
  account: BankAccount | null;
  onClose: () => void;
  onCompleted: () => void;
}

export default function BankVerificationDrawer({ open, account, onClose, onCompleted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  if (!account) return null;

  async function handleVerify() {
    if (!account) return;

    setError("");
    setSubmitting(true);

    try {
      await verifyBankAccount(account.id);
      onCompleted();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to verify bank account"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close bank review"
        onClick={onClose}
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">
              Bank Review
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {account.bankName || "Bank account"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                <CreditCard size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Account details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {account.accountHolderName}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    account.verified
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {account.verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-slate-200 p-5">
            <Detail label="Employee" value={account.employee?.name} />
            <Detail label="Employee Code" value={account.employee?.employeeCode} />
            <Detail label="Bank Name" value={account.bankName || "-"} />
            <Detail label="Account Number" value={`****${account.accountNumber?.slice(-4)}`} />
            <Detail label="IFSC" value={account.ifscCode} />
            <Detail label="UPI" value={account.upiId || "-"} />
            <Detail
              label="Submitted On"
              value={new Date(account.createdAt).toLocaleString()}
            />
          </section>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-6">
          <button
            type="button"
            disabled={submitting || account.verified}
            onClick={handleVerify}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
            {account.verified ? "Already verified" : "Verify bank account"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <strong className="text-right text-sm font-semibold text-slate-900">
        {value || "-"}
      </strong>
    </div>
  );
}
