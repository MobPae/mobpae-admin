import { useState } from "react";
import { useEscKey } from "../../lib/useEscKey";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Loader2, FileText, ExternalLink } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { verifyKycDocument, rejectKycDocument } from "../../services/kycService";
import type { KycDocument } from "../../types/kyc";
import { useSignedUrl } from "../../hooks/useSignedUrl";

interface Props {
  open: boolean;
  document: KycDocument | null;
  onClose: () => void;
  onCompleted: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  VERIFIED: "bg-success-bg text-success-dark",
  REJECTED: "bg-danger-soft text-danger",
};

const DOC_LABEL: Record<string, string> = {
  AADHAR:      "Aadhaar",
  PAN:         "PAN Card",
  SALARY_SLIP: "Salary Slip",
  OTHER:       "Other",
};

export default function KycDrawer({ open, document, onClose, onCompleted }: Props) {
  useEscKey(open, onClose);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  // Fetch signed URL before early return so hook order is stable
  const { url: fileUrl, isLoading: fileUrlLoading } = useSignedUrl(document?.filePath ?? null);

  const verifyMutation = useMutation({
    mutationFn: () => verifyKycDocument(document!.id),
    onSuccess: () => {
      toast.success("Document verified", { description: `${document?.employee.name}'s ${DOC_LABEL[document?.documentType ?? ""] ?? document?.documentType} approved.` });
      onCompleted();
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: getApiErrorMessage(err) });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectKycDocument(document!.id, rejectNote.trim() || undefined),
    onSuccess: () => {
      toast.success("Document rejected", { description: `${document?.employee.name}'s KYC document has been rejected.` });
      setRejectMode(false);
      setRejectNote("");
      onCompleted();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: getApiErrorMessage(err) });
    },
  });

  if (!open || !document) return null;

  const isBusy  = verifyMutation.isPending || rejectMutation.isPending;
  const canAct  = document.status === "PENDING";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {document.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{document.employee.name}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{document.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[document.status] ?? "bg-surface-muted text-ink-3"}`}>
              {document.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Document info */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Document</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Type",         v: DOC_LABEL[document.documentType] ?? document.documentType },
                { k: "Status",       v: document.status },
                { k: "Submitted on", v: new Date(document.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(document.verifiedAt ? [{ k: "Reviewed on", v: new Date(document.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(document.verifiedBy ? [{ k: "Reviewed by", v: document.verifiedBy }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* File */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">File</p>
            <div className="border border-edge rounded-lg px-3 py-3 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                <FileText size={13} className="text-ink-3" />
              </div>
              {fileUrlLoading ? (
                <p className="text-[11px] text-ink-3">Loading…</p>
              ) : fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-[500] text-brand hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={11} />
                  {/\.pdf$/i.test(document.filePath) ? "Open PDF" : "View document"}
                </a>
              ) : (
                <p className="text-[11px] text-ink-3 break-all leading-relaxed">{document.filePath}</p>
              )}
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">Employee</p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Name",          v: document.employee.name },
                { k: "Employee code", v: <span className="font-mono">{document.employee.employeeCode}</span> },
                { k: "Email",         v: document.employee.email },
                { k: "Employer",      v: document.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {!canAct && (
            <div className="bg-canvas rounded-md px-3 py-2.5 border border-edge">
              <p className="text-[11px] text-ink-3">
                {document.status === "VERIFIED" ? "This document has already been verified." : "This document has been rejected."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {canAct && (
          <div className="border-t border-edge px-5 py-3.5 flex-shrink-0 flex flex-col gap-2">
            {rejectMode && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-ink-3 font-[500]">Rejection reason <span className="font-normal">(optional — shown to employee)</span></label>
                <textarea
                  autoFocus
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="e.g. Document is blurry, please re-upload a clearer copy."
                  rows={2}
                  className="w-full text-[12px] text-ink border border-edge rounded-md px-3 py-2 resize-none bg-canvas placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand/30"
                />
              </div>
            )}
            <div className="flex gap-2">
              {rejectMode ? (
                <>
                  <button
                    onClick={() => { setRejectMode(false); setRejectNote(""); }}
                    disabled={isBusy}
                    className="h-8 px-3 rounded-md border border-edge text-[12px] font-[500] text-ink-3 hover:bg-surface-muted transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate()}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-red-600 hover:bg-red-700 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {rejectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    {rejectMutation.isPending ? "Rejecting…" : "Confirm Reject"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRejectMode(true)}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md border border-red-200 bg-danger-soft hover:bg-danger-bg text-[12px] font-[500] text-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                  <button
                    onClick={() => verifyMutation.mutate()}
                    disabled={isBusy}
                    className="flex-1 h-8 rounded-md bg-[#111827] hover:bg-[#2A2C45] text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    {verifyMutation.isPending ? "Verifying…" : "Verify"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
