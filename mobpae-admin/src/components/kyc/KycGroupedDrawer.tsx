import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Loader2, ExternalLink, FileText } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { getKycDocuments, verifyKycDocument, rejectKycDocument } from "../../services/kycService";
import type { KycDocument, KycEmployeeGroup } from "../../types/kyc";

interface Props {
  open: boolean;
  group: KycEmployeeGroup | null;
  groupQueryKey: unknown[];
  onClose: () => void;
}

const DOC_LABEL: Record<string, string> = {
  PAN:         "PAN Card",
  AADHAR:      "Aadhaar",
  SALARY_SLIP: "Salary Slip",
  OTHER:       "Other",
};

const DOC_ORDER = ["PAN", "AADHAR", "SALARY_SLIP", "OTHER"];

const STATUS_BADGE: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50/80",   label: "Pending"  },
  VERIFIED: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50/80", label: "Verified" },
  REJECTED: { dot: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50/80",     label: "Rejected" },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function DocCard({
  doc,
  employeeName,
  docQueryKey,
  groupQueryKey,
}: {
  doc: KycDocument;
  employeeName: string;
  docQueryKey: unknown[];
  groupQueryKey: unknown[];
}) {
  const qc = useQueryClient();

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: docQueryKey });
    void qc.invalidateQueries({ queryKey: groupQueryKey });
  };

  const verifyMutation = useMutation({
    mutationFn: () => verifyKycDocument(doc.id),
    onSuccess: () => {
      toast.success("Document approved", {
        description: `${employeeName}'s ${DOC_LABEL[doc.documentType] ?? doc.documentType} verified.`,
      });
      refresh();
    },
    onError: (err: unknown) => {
      toast.error("Verification failed", { description: getApiErrorMessage(err) });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectKycDocument(doc.id),
    onSuccess: () => {
      toast.success("Document rejected", {
        description: `${employeeName}'s ${DOC_LABEL[doc.documentType] ?? doc.documentType} rejected.`,
      });
      refresh();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: getApiErrorMessage(err) });
    },
  });

  const sc     = STATUS_BADGE[doc.status] ?? STATUS_BADGE.PENDING;
  const isBusy = verifyMutation.isPending || rejectMutation.isPending;
  const canAct = doc.status === "PENDING";

  const fileUrl = doc.filePath.startsWith("http")
    ? doc.filePath
    : `${API_BASE.replace(/\/api$/, "")}/${doc.filePath.replace(/^\//, "")}`;

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.filePath);
  const isPdf   = /\.pdf$/i.test(doc.filePath);

  return (
    <div className={`border rounded-xl overflow-hidden ${canAct ? "border-slate-200" : "border-slate-100"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-[12px] font-[600] text-slate-900">{DOC_LABEL[doc.documentType] ?? doc.documentType}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-[500] ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      <div className="px-4 divide-y divide-slate-50">
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] text-slate-400">Uploaded</span>
          <span className="text-[11px] font-[500] text-slate-700">
            {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
        {doc.verifiedAt && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-slate-400">
              {doc.status === "REJECTED" ? "Rejected on" : "Verified on"}
            </span>
            <span className="text-[11px] font-[500] text-slate-700">
              {new Date(doc.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
        {doc.verifiedBy && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-slate-400">Reviewed by</span>
            <span className="text-[11px] font-[500] text-slate-700 truncate max-w-[55%] text-right">{doc.verifiedBy}</span>
          </div>
        )}
      </div>

      {/* File preview */}
      <div className="px-4 pb-3">
        {isImage ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
            <img
              src={fileUrl}
              alt={DOC_LABEL[doc.documentType]}
              className="w-full rounded-lg border border-slate-100 object-contain max-h-[120px]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </a>
        ) : (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-[11px] font-[500] text-[#059669] hover:underline"
          >
            <ExternalLink size={11} />
            {isPdf ? "Open PDF" : "View file"}
          </a>
        )}
      </div>

      {/* Actions */}
      {canAct && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={isBusy}
            className="flex-1 h-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-[11px] font-[500] text-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {rejectMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            {rejectMutation.isPending ? "Rejecting…" : "Reject"}
          </button>
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={isBusy}
            className="flex-1 h-7 rounded-md bg-slate-900 hover:bg-slate-700 text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {verifyMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
            {verifyMutation.isPending ? "Approving…" : "Approve"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function KycGroupedDrawer({ open, group, groupQueryKey, onClose }: Props) {
  const docQueryKey = ["kyc-docs-employee", group?.employeeId];

  // Fetch the actual documents for this employee when the drawer opens
  const { data: docs = [], isLoading } = useQuery<KycDocument[]>({
    queryKey: docQueryKey,
    queryFn: () => getKycDocuments(undefined, group!.employeeId),
    enabled: open && !!group?.employeeId,
  });

  if (!open || !group) return null;

  const first = group.employeeName.charAt(0).toUpperCase();

  const sortedDocs = [...docs].sort(
    (a, b) =>
      (DOC_ORDER.indexOf(a.documentType) === -1 ? 99 : DOC_ORDER.indexOf(a.documentType)) -
      (DOC_ORDER.indexOf(b.documentType) === -1 ? 99 : DOC_ORDER.indexOf(b.documentType))
  );

  const presentTypes = new Set(docs.map(d => d.documentType));
  const missingTypes = (["PAN", "AADHAR", "SALARY_SLIP"] as const).filter(t => !presentTypes.has(t));

  const pendingCount  = docs.filter(d => d.status === "PENDING").length;
  const verifiedCount = docs.filter(d => d.status === "VERIFIED").length;
  const rejectedCount = docs.filter(d => d.status === "REJECTED").length;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-slate-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[12px] font-[600]">
              {first}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-slate-900 leading-none">{group.employeeName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                <span className="font-mono">{group.employeeCode}</span>
                <span className="mx-1.5 text-slate-200">·</span>
                {group.companyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && (
              <div className="flex items-center gap-1.5 text-[10px] font-[500]">
                {verifiedCount > 0 && <span className="text-emerald-600">{verifiedCount} verified</span>}
                {pendingCount  > 0 && <span className="text-amber-600">{pendingCount} pending</span>}
                {rejectedCount > 0 && <span className="text-red-500">{rejectedCount} rejected</span>}
              </div>
            )}
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
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-slate-400">Loading documents…</p>
            </div>
          ) : sortedDocs.length === 0 && missingTypes.length === 3 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-slate-500 font-[500]">No documents uploaded yet</p>
              <p className="text-[12px] text-slate-400 mt-1">The employee hasn't submitted any KYC documents.</p>
            </div>
          ) : (
            <>
              {sortedDocs.map(doc => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  employeeName={group.employeeName}
                  docQueryKey={docQueryKey}
                  groupQueryKey={groupQueryKey}
                />
              ))}

              {/* Missing doc type slots */}
              {missingTypes.map(type => (
                <div key={type} className="border border-dashed border-slate-200 rounded-xl px-4 py-4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[12px] font-[500] text-slate-400">{DOC_LABEL[type]}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Not uploaded</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
