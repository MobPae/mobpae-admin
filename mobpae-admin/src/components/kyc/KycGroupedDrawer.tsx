import { useState } from "react";
import { useEscKey } from "../../lib/useEscKey";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Loader2, ExternalLink, FileText, Camera } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { getKycDocuments, verifyKycDocument, rejectKycDocument } from "../../services/kycService";
import { getEmployee, verifySelfie, rejectSelfie } from "../../services/employeeService";
import type { KycDocument, KycEmployeeGroup } from "../../types/kyc";
import type { Employee } from "../../types/employee";
import { useSignedUrl } from "../../hooks/useSignedUrl";

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

// Extension detection still works on R2 object keys (keys end with the original extension)
function keyIsImage(key: string) { return /\.(jpg|jpeg|png|webp|gif)$/i.test(key); }
function keyIsPdf(key: string)   { return /\.pdf$/i.test(key); }

const STATUS_BADGE: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:  { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50/80",   label: "Pending"  },
  VERIFIED: { dot: "bg-[#22C55E]", text: "text-success-dark", bg: "bg-success-bg/80", label: "Verified" },
  REJECTED: { dot: "bg-red-400", text: "text-danger", bg: "bg-danger-soft/80",     label: "Rejected" },
};

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
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

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
    mutationFn: () => rejectKycDocument(doc.id, rejectNote.trim() || undefined),
    onSuccess: () => {
      toast.success("Document rejected", {
        description: `${employeeName}'s ${DOC_LABEL[doc.documentType] ?? doc.documentType} rejected.`,
      });
      setRejectMode(false);
      setRejectNote("");
      refresh();
    },
    onError: (err: unknown) => {
      toast.error("Rejection failed", { description: getApiErrorMessage(err) });
    },
  });

  const sc     = STATUS_BADGE[doc.status] ?? STATUS_BADGE.PENDING;
  const isBusy = verifyMutation.isPending || rejectMutation.isPending;
  const canAct = doc.status === "PENDING";

  const { url: fileUrl } = useSignedUrl(doc.filePath);
  const isImage = keyIsImage(doc.filePath);
  const isPdf   = keyIsPdf(doc.filePath);

  return (
    <div className={`border rounded-xl overflow-hidden ${canAct ? "border-edge" : "border-edge"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-canvas/60 border-b border-edge">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-ink-3 flex-shrink-0" />
          <span className="text-[12px] font-[600] text-ink">{DOC_LABEL[doc.documentType] ?? doc.documentType}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[11px] font-[500] ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      <div className="px-4 divide-y divide-edge-2">
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] text-ink-3">Uploaded</span>
          <span className="text-[11px] font-[500] text-ink-3">
            {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
        {doc.verifiedAt && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-ink-3">
              {doc.status === "REJECTED" ? "Rejected on" : "Verified on"}
            </span>
            <span className="text-[11px] font-[500] text-ink-3">
              {new Date(doc.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
        {doc.verifiedBy && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-ink-3">Reviewed by</span>
            <span className="text-[11px] font-[500] text-ink-3 truncate max-w-[55%] text-right">{doc.verifiedBy}</span>
          </div>
        )}
      </div>

      {/* File preview */}
      <div className="px-4 pb-3">
        {isImage ? (
          <a href={fileUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="block mt-2">
            <img
              src={fileUrl ?? undefined}
              alt={DOC_LABEL[doc.documentType]}
              className="w-full rounded-lg border border-edge object-contain max-h-[120px]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </a>
        ) : (
          <a
            href={fileUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-[11px] font-[500] text-brand hover:underline"
          >
            <ExternalLink size={11} />
            {isPdf ? "Open PDF" : "View file"}
          </a>
        )}
      </div>

      {/* Actions */}
      {canAct && (
        <div className="px-4 pb-3 space-y-2">
          {rejectMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-ink-3 font-[500]">Reason <span className="font-normal">(optional — shown to employee)</span></label>
              <textarea
                autoFocus
                rows={2}
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Document is blurry, please re-upload a clearer copy."
                className="w-full text-[11px] border border-edge rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-red-300 bg-canvas"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setRejectMode(false); setRejectNote(""); }}
                  disabled={isBusy}
                  className="h-7 px-2.5 rounded-md border border-edge text-[11px] font-[500] text-ink-3 hover:bg-surface-muted transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={isBusy}
                  className="flex-1 h-7 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-[500] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {rejectMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                  {rejectMutation.isPending ? "Rejecting…" : "Confirm Reject"}
                </button>
              </div>
            </div>
          )}
          {!rejectMode && (
          <div className="flex gap-2">
          <button
            onClick={() => setRejectMode(true)}
            disabled={isBusy}
            className="flex-1 h-7 rounded-md border border-red-200 bg-danger-soft hover:bg-danger-bg text-[11px] font-[500] text-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <XCircle size={11} /> Reject
          </button>
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={isBusy}
            className="flex-1 h-7 rounded-md bg-[#111827] hover:bg-[#2A2C45] text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {verifyMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
            {verifyMutation.isPending ? "Approving…" : "Approve"}
          </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function SelfieCard({
  employee,
  employeeQueryKey,
  groupQueryKey,
}: {
  employee: Employee;
  employeeQueryKey: unknown[];
  groupQueryKey: unknown[];
}) {
  const qc = useQueryClient();
  const [showReject, setShowReject] = useState(false);
  const [remarks, setRemarks] = useState("");

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: employeeQueryKey });
    void qc.invalidateQueries({ queryKey: groupQueryKey });
  };

  const verifyMut = useMutation({
    mutationFn: () => verifySelfie(employee.id),
    onSuccess: () => { toast.success("Selfie verified"); setShowReject(false); refresh(); },
    onError: (err: unknown) => toast.error("Failed", { description: getApiErrorMessage(err) }),
  });

  const rejectMut = useMutation({
    mutationFn: () => rejectSelfie(employee.id, remarks),
    onSuccess: () => { toast.success("Selfie rejected"); setShowReject(false); setRemarks(""); refresh(); },
    onError: (err: unknown) => toast.error("Failed", { description: getApiErrorMessage(err) }),
  });

  const selfieStatus = employee.selfieStatus ?? "PENDING";
  const sc     = STATUS_BADGE[selfieStatus] ?? STATUS_BADGE.PENDING;
  const isBusy = verifyMut.isPending || rejectMut.isPending;
  const canAct = selfieStatus === "PENDING";

  const { url: selfieUrl } = useSignedUrl(employee.selfieUrl ?? null);

  return (
    <div className="border rounded-xl overflow-hidden border-edge">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-canvas/60 border-b border-edge">
        <div className="flex items-center gap-2">
          <Camera size={13} className="text-ink-3 flex-shrink-0" />
          <span className="text-[12px] font-[600] text-ink">Selfie</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[11px] font-[500] ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Meta */}
      {employee.selfieVerifiedAt && (
        <div className="px-4 divide-y divide-edge-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-[11px] text-ink-3">
              {selfieStatus === "REJECTED" ? "Rejected on" : "Verified on"}
            </span>
            <span className="text-[11px] font-[500] text-ink-3">
              {new Date(employee.selfieVerifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      )}

      {/* Selfie image */}
      <div className="px-4 pb-3 pt-2">
        {selfieUrl ? (
          <a href={selfieUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={selfieUrl}
              alt="Employee selfie"
              className="w-full rounded-lg border border-edge object-cover"
              style={{ maxHeight: 160 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </a>
        ) : (
          <div className="bg-canvas rounded-lg h-[80px] flex items-center justify-center">
            <p className="text-[11px] text-ink-3">No selfie uploaded yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {canAct && selfieUrl && (
        <div className="px-4 pb-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowReject(v => !v)}
              disabled={isBusy}
              className="flex-1 h-7 rounded-md border border-red-200 bg-danger-soft hover:bg-danger-bg text-[11px] font-[500] text-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <XCircle size={11} /> Reject
            </button>
            <button
              onClick={() => verifyMut.mutate()}
              disabled={isBusy}
              className="flex-1 h-7 rounded-md bg-[#111827] hover:bg-[#2A2C45] text-[11px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {verifyMut.isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              {verifyMut.isPending ? "Approving…" : "Approve"}
            </button>
          </div>
          {showReject && (
            <div className="space-y-1.5">
              <textarea
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Rejection reason…"
                className="w-full text-[11px] border border-edge rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
              />
              <button
                onClick={() => rejectMut.mutate()}
                disabled={rejectMut.isPending || !remarks.trim()}
                className="w-full h-7 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-[500] transition-colors disabled:opacity-50"
              >
                {rejectMut.isPending ? "Submitting…" : "Confirm Rejection"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KycGroupedDrawer({ open, group, groupQueryKey, onClose }: Props) {
  useEscKey(open, onClose);
  const docQueryKey      = ["kyc-docs-employee", group?.employeeId];
  const employeeQueryKey = ["employee", group?.employeeId];

  // Fetch the actual documents for this employee when the drawer opens
  const { data: docs = [], isLoading } = useQuery<KycDocument[]>({
    queryKey: docQueryKey,
    queryFn: () => getKycDocuments(undefined, group!.employeeId),
    enabled: open && !!group?.employeeId,
  });

  // Fetch employee for selfie data
  const { data: employee } = useQuery<Employee>({
    queryKey: employeeQueryKey,
    queryFn: () => getEmployee(group!.employeeId),
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

      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {first}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{group.employeeName}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">
                <span className="font-mono">{group.employeeCode}</span>
                <span className="mx-1.5 text-ink-disabled">·</span>
                {group.companyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && (
              <div className="flex items-center gap-1.5 text-[11px] font-[500]">
                {verifiedCount > 0 && <span className="text-brand">{verifiedCount} verified</span>}
                {pendingCount  > 0 && <span className="text-warning">{pendingCount} pending</span>}
                {rejectedCount > 0 && <span className="text-danger">{rejectedCount} rejected</span>}
              </div>
            )}
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
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-ink-3">Loading documents…</p>
            </div>
          ) : sortedDocs.length === 0 && missingTypes.length === 3 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-ink-3 font-[500]">No documents uploaded yet</p>
              <p className="text-[12px] text-ink-3 mt-1">The employee hasn't submitted any KYC documents.</p>
            </div>
          ) : (
            <>
              {/* Selfie card — always shown if employee loaded */}
              {employee && (
                <SelfieCard
                  employee={employee}
                  employeeQueryKey={employeeQueryKey}
                  groupQueryKey={groupQueryKey}
                />
              )}

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
                <div key={type} className="border border-dashed border-edge rounded-xl px-4 py-4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-ink-3" />
                  </div>
                  <div>
                    <p className="text-[12px] font-[500] text-ink-3">{DOC_LABEL[type]}</p>
                    <p className="text-[11px] text-ink-3 mt-0.5">Not uploaded</p>
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
