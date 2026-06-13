import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";
import { verifyKycDocument, rejectKycDocument } from "../../services/kycService";
import type { KycDocument } from "../../types/kyc";

interface Props {
  open: boolean;
  document: KycDocument | null;
  onClose: () => void;
  onCompleted: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  VERIFIED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
};

const DOC_LABEL: Record<string, string> = {
  AADHAR:      "Aadhaar",
  PAN:         "PAN Card",
  SALARY_SLIP: "Salary Slip",
  OTHER:       "Other",
};

export default function KycDrawer({ open, document, onClose, onCompleted }: Props) {
  const verifyMutation = useMutation({
    mutationFn: () => verifyKycDocument(document!.id),
    onSuccess: () => {
      toast.success("Document verified", { description: `${document?.employee.name}'s ${DOC_LABEL[document?.documentType ?? ""] ?? document?.documentType} approved.` });
      onCompleted();
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: err instanceof Error ? err.message : "Unexpected error" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectKycDocument(document!.id),
    onSuccess: () => {
      toast.success("Document rejected", { description: `${document?.employee.name}'s KYC document has been rejected.` });
      onCompleted();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: err instanceof Error ? err.message : "Unexpected error" });
    },
  });

  if (!open || !document) return null;

  const isBusy  = verifyMutation.isPending || rejectMutation.isPending;
  const canAct  = document.status === "PENDING";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {document.employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{document.employee.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{document.employee.employer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[10px] font-[500] ${STATUS_BADGE[document.status] ?? "bg-slate-100 text-slate-500"}`}>
              {document.status}
            </span>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Document info */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Document</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Type",         v: DOC_LABEL[document.documentType] ?? document.documentType },
                { k: "Status",       v: document.status },
                { k: "Submitted on", v: new Date(document.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ...(document.verifiedAt ? [{ k: "Reviewed on", v: new Date(document.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }] : []),
                ...(document.verifiedBy ? [{ k: "Reviewed by", v: document.verifiedBy }] : []),
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* File */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">File</p>
            <div className="border border-slate-100 rounded-lg px-3 py-3 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={13} className="text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-500 break-all leading-relaxed">{document.filePath}</p>
            </div>
          </section>

          {/* Employee */}
          <section>
            <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-slate-400 mb-2">Employee</p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              {[
                { k: "Name",          v: document.employee.name },
                { k: "Employee code", v: <span className="font-mono">{document.employee.employeeCode}</span> },
                { k: "Email",         v: document.employee.email },
                { k: "Employer",      v: document.employee.employer.companyName },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-slate-400">{k}</span>
                  <span className="text-[11px] font-[500] text-slate-800 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {!canAct && (
            <div className="bg-slate-50 rounded-md px-3 py-2.5 border border-slate-100">
              <p className="text-[11px] text-slate-500">
                {document.status === "VERIFIED" ? "This document has already been verified." : "This document has been rejected."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {canAct && (
          <div className="border-t border-slate-100 px-5 py-3.5 flex-shrink-0 flex gap-2">
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={isBusy}
              className="flex-1 h-8 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-[12px] font-[500] text-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {rejectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              {rejectMutation.isPending ? "Rejecting…" : "Reject"}
            </button>
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={isBusy}
              className="flex-1 h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              {verifyMutation.isPending ? "Verifying…" : "Verify"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
