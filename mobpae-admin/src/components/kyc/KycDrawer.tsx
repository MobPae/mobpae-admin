import { CheckCircle2, FileText, Loader2, X, XCircle } from "lucide-react";
import { useState } from "react";
import type { KycDocument } from "../../types/kyc";
import { rejectKycDocument, verifyKycDocument } from "../../services/kycService";

interface Props {
  open: boolean;
  document: KycDocument | null;
  onClose: () => void;
  onCompleted: () => void;
}

export default function KycDrawer({ open, document, onClose, onCompleted }: Props) {
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  if (!open) return null;

  if (!document) return null;

  async function handleDecision(action: "approve" | "reject") {
    if (!document) return;

    setError("");
    setSubmitting(action);

    try {
      if (action === "approve") {
        await verifyKycDocument(document.id);
      } else {
        await rejectKycDocument(document.id);
      }

      onCompleted();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update KYC document"
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close KYC review"
        onClick={onClose}
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">
              KYC Review
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {document.documentType}
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
                <FileText size={22} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Submitted document
                </h3>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {document.filePath}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {document.status}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-slate-200 p-5">
            <Detail label="Employee" value={document.employee?.name} />
            <Detail label="Employee Code" value={document.employee?.employeeCode} />
            <Detail label="Email" value={document.employee?.email} />
            <Detail
              label="Employer"
              value={document.employee?.employer?.companyName || "-"}
            />
            <Detail
              label="Submitted On"
              value={new Date(document.createdAt).toLocaleString()}
            />
          </section>

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            For this MVP, uploaded PDFs are accepted as submitted. Approving only
            changes the KYC status to verified.
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-6">
          <button
            type="button"
            disabled={Boolean(submitting)}
            onClick={() => handleDecision("reject")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {submitting === "reject" ? <Loader2 className="animate-spin" size={17} /> : <XCircle size={17} />}
            Reject
          </button>

          <button
            type="button"
            disabled={Boolean(submitting)}
            onClick={() => handleDecision("approve")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting === "approve" ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
            Approve
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
