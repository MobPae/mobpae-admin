import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { X, CheckCircle, XCircle, Camera } from "lucide-react";
import type { Employee } from "../../types/employee";
import { verifySelfie, rejectSelfie } from "../../services/employeeService";
import { useSignedUrl } from "../../hooks/useSignedUrl";

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   "bg-success-bg text-success-dark",
  INACTIVE: "bg-surface-muted text-ink-3",
};

const SELFIE_BADGE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  VERIFIED: "bg-success-bg text-success-dark",
  REJECTED: "bg-danger-soft text-danger",
};

export default function EmployeeDrawer({ open, employee, onClose, onRefresh }: Props) {
  useEscKey(open, onClose);
  const [rejectRemarks, setRejectRemarks]     = useState("");
  const [showRejectBox, setShowRejectBox]     = useState(false);
  const [selfieLoading, setSelfieLoading]     = useState(false);
  const [selfieError,   setSelfieError]       = useState("");

  // Hook must be called before any early return to keep hook order stable
  const { url: selfieImgUrl } = useSignedUrl(employee?.selfieUrl ?? null);

  if (!open || !employee) return null;

  const selfieStatus = employee.selfieStatus ?? "PENDING";

  async function handleVerify() {
    setSelfieLoading(true);
    setSelfieError("");
    try {
      await verifySelfie(employee!.id);
      onRefresh?.();
      onClose();
    } catch {
      setSelfieError("Verification failed. Please try again.");
    } finally {
      setSelfieLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectRemarks.trim()) { setSelfieError("Remarks are required for rejection."); return; }
    setSelfieLoading(true);
    setSelfieError("");
    try {
      await rejectSelfie(employee!.id, rejectRemarks.trim());
      onRefresh?.();
      onClose();
    } catch {
      setSelfieError("Rejection failed. Please try again.");
    } finally {
      setSelfieLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111827] to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{employee.name}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[employee.employmentStatus]}`}>
              {employee.employmentStatus}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-ink-3 hover:text-ink-3 hover:bg-surface-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Personal */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Personal details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Full name",  v: employee.name             },
                { k: "Email",      v: employee.email            },
                { k: "Phone",      v: employee.phone            },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employment */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Employment details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Employee code",  v: <span className="font-mono">{employee.employeeCode}</span> },
                { k: "Salary in hand", v: `₹${Number(employee.salaryInHand).toLocaleString("en-IN")}` },
                { k: "Joining date",   v: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set" },
                { k: "App access",     v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${employee.appActivated ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-surface-muted text-ink-3"}`}>{employee.appActivated ? "Enabled" : "Disabled"}</span> },
                { k: "Member since",   v: new Date(employee.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Employer */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Employer
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Company",      v: employee.employer.companyName },
                { k: "Company code", v: <span className="font-mono">{employee.employer.companyCode}</span> },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Selfie */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Selfie verification
            </p>
            <div className="border border-edge rounded-lg p-3 space-y-3">
              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ink-3 flex items-center gap-1.5">
                  <Camera size={12} /> Status
                </span>
                <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${SELFIE_BADGE[selfieStatus]}`}>
                  {selfieStatus}
                </span>
              </div>

              {/* Selfie image */}
              {selfieImgUrl ? (
                <img
                  src={selfieImgUrl}
                  alt="Employee selfie"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: 200 }}
                />
              ) : (
                <div className="bg-canvas rounded-lg h-[100px] flex items-center justify-center">
                  <p className="text-[11px] text-ink-3">No selfie uploaded</p>
                </div>
              )}

              {/* Selfie verified at */}
              {employee.selfieVerifiedAt && (
                <p className="text-[11px] text-ink-3">
                  Verified {new Date(employee.selfieVerifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              )}

              {/* Actions — only when PENDING */}
              {selfieStatus === "PENDING" && selfieImgUrl && (
                <div className="space-y-2">
                  {selfieError && (
                    <p className="text-[11px] text-danger bg-danger-soft rounded px-2 py-1">{selfieError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleVerify()}
                      disabled={selfieLoading}
                      className="flex-1 h-8 rounded-lg bg-brand hover:bg-[#2048EE] text-white text-[11px] font-[500] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Verify
                    </button>
                    <button
                      onClick={() => setShowRejectBox(v => !v)}
                      disabled={selfieLoading}
                      className="flex-1 h-8 rounded-lg bg-danger-soft hover:bg-danger-bg text-red-700 text-[11px] font-[500] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                  {showRejectBox && (
                    <div className="space-y-2">
                      <textarea
                        value={rejectRemarks}
                        onChange={e => setRejectRemarks(e.target.value)}
                        placeholder="Reason for rejection…"
                        rows={2}
                        className="w-full border border-edge rounded-lg px-2 py-1.5 text-[11px] text-ink-3 resize-none focus:outline-none focus:border-red-400"
                      />
                      <button
                        onClick={() => void handleReject()}
                        disabled={selfieLoading || !rejectRemarks.trim()}
                        className="w-full h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-[500] transition-colors disabled:opacity-50"
                      >
                        {selfieLoading ? "Submitting…" : "Confirm Rejection"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
