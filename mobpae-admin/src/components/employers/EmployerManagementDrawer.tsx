import { useEscKey } from "../../lib/useEscKey";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Ban, CheckCircle2, Loader2, RotateCcw, RefreshCw, Save, Users } from "lucide-react";
import { getApiErrorMessage } from "../../utils/api-errors";
import { updateEmployerStatus, getEmployerProductConfigs, upsertEmployerProductConfig, getEmployerMembers, getEmployerInvites, type EmployerProductConfig } from "../../services/employerService";
import { processRecovery } from "../../services/payrollService";
import { getLoanApplicationsByEmployer } from "../../services/loanApplicationService";
import type { Employer, EmployerMember, EmployerInvite } from "../../types/employer";
import type { LoanApplication } from "../../types/loan-application";
import { ConfirmModal } from "../ui/ConfirmModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onMutated: () => void;
  employer: Employer | null;
}

const STATUS_BADGE: Record<Employer["status"], { cls: string; label: string }> = {
  ACTIVE:    { cls: "bg-success-bg text-success-dark", label: "Active" },
  PENDING:   { cls: "bg-amber-50 text-amber-700", label: "Pending" },
  APPROVED:  { cls: "bg-success-bg text-success-dark", label: "Approved" },
  REJECTED:  { cls: "bg-danger-soft text-danger", label: "Rejected" },
  INACTIVE:  { cls: "bg-surface-muted text-ink-3", label: "Inactive" },
  SUSPENDED: { cls: "bg-warning-bg text-warning-dark", label: "Suspended" },
};

const RISK_BADGE: Record<Employer["riskStatus"], string> = {
  GOOD:    "bg-success-bg text-success-dark",
  WARNING: "bg-warning-bg text-warning-dark",
  BLOCKED: "bg-danger-soft text-danger",
};

const SR_STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED:            { cls: "bg-amber-50 text-amber-700", label: "Submitted" },
  EMPLOYER_APPROVED:    { cls: "bg-[#DBEAFE] text-[#1D4ED8]", label: "Emp. Approved" },
  EMPLOYER_REJECTED:    { cls: "bg-danger-soft text-danger", label: "Rejected" },
  READY_FOR_DISBURSAL:  { cls: "bg-lime-50 text-lime-700", label: "Ready" },
  DISBURSED:            { cls: "bg-success-bg text-success-dark", label: "Disbursed" },
  REPAYMENT_SCHEDULED:  { cls: "bg-warning-bg text-warning-dark", label: "Repaying" },
  REPAID:               { cls: "bg-success-bg text-[#166534]", label: "Repaid" },
};

const ROLE_BADGE: Record<string, string> = {
  OWNER:   "bg-[#EDE9FE] text-[#6D28D9]",
  ADMIN:   "bg-[#DBEAFE] text-[#1D4ED8]",
  HR:      "bg-[#D1FAE5] text-[#065F46]",
  FINANCE: "bg-amber-50 text-amber-700",
  VIEWER:  "bg-surface-muted text-ink-3",
};

export default function EmployerManagementDrawer({ open, onClose, onMutated, employer }: Props) {
  useEscKey(open, onClose);
  const qc = useQueryClient();
  const [suspendConfirm,    setSuspendConfirm]    = useState(false);
  const [recoveryConfirm,   setRecoveryConfirm]   = useState(false);
  const [overrideInput,     setOverrideInput]     = useState<string>("");

  const resetSignature = open ? (employer?.id ?? null) : null;
  const [prevResetSignature, setPrevResetSignature] = useState(resetSignature);
  if (resetSignature !== prevResetSignature) {
    setPrevResetSignature(resetSignature);
    if (open) { setSuspendConfirm(false); setRecoveryConfirm(false); }
  }

  const { data: recentRequests = [], isLoading: reqLoading } = useQuery<LoanApplication[]>({
    queryKey: ["loan-applications-employer", employer?.id],
    queryFn: () => getLoanApplicationsByEmployer(employer!.id, 10),
    enabled: open && !!employer?.id,
    staleTime: 60_000,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<EmployerMember[]>({
    queryKey: ["employer-members", employer?.id],
    queryFn: () => getEmployerMembers(employer!.id),
    enabled: open && !!employer?.id,
    staleTime: 60_000,
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery<EmployerInvite[]>({
    queryKey: ["employer-invites", employer?.id],
    queryFn: () => getEmployerInvites(employer!.id),
    enabled: open && !!employer?.id,
    staleTime: 60_000,
  });

  const { data: productConfigs = [] } = useQuery<EmployerProductConfig[]>({
    queryKey: ["employer-product-configs", employer?.id],
    queryFn: () => getEmployerProductConfigs(employer!.id),
    enabled: open && !!employer?.id,
    staleTime: 60_000,
  });
  const saConfig = productConfigs.find(c => c.product.productType === "SA");

  // Sync the override input when saConfig loads or the drawer switches employer,
  // using the same render-time-adjustment technique as resetSignature above.
  const overrideSignature = `${employer?.id ?? ""}:${saConfig?.maximumAdvanceAmountOverride ?? ""}`;
  const [prevOverrideSignature, setPrevOverrideSignature] = useState(overrideSignature);
  if (overrideSignature !== prevOverrideSignature) {
    setPrevOverrideSignature(overrideSignature);
    setOverrideInput(
      saConfig?.maximumAdvanceAmountOverride != null
        ? String(saConfig.maximumAdvanceAmountOverride)
        : ""
    );
  }

  const overrideMutation = useMutation({
    mutationFn: (amount: number | null) =>
      upsertEmployerProductConfig(employer!.id, "SA", { maximumAdvanceAmountOverride: amount }),
    onSuccess: () => {
      toast.success("Advance override saved");
      qc.invalidateQueries({ queryKey: ["employer-product-configs", employer?.id] });
    },
    onError: (err: unknown) => toast.error("Save failed", { description: getApiErrorMessage(err) }),
  });

  const mutation = useMutation({
    mutationFn: (status: Employer["status"]) => updateEmployerStatus(employer!.id, status),
    onSuccess: (data, status) => {
      const labels: Record<Employer["status"], string> = {
        ACTIVE: "activated", INACTIVE: "deactivated", SUSPENDED: "suspended",
        PENDING: "set to pending", APPROVED: "approved", REJECTED: "rejected",
      };
      onMutated();
      if (status === "ACTIVE" && data.emailDelivered === false) {
        toast.warning("Employer activated, but email delivery failed", {
          description: "Use backend console logs while testing. Credentials are never exposed in API responses.",
        });
        onClose();
      } else {
        if (status === "ACTIVE" && data.emailDelivered) {
          toast.success("Login credentials emailed successfully", {
            description: `${employer?.companyName} has been activated.`,
          });
        } else {
          toast.success(`Employer ${labels[status]}`, {
            description: `${employer?.companyName} has been ${labels[status]}.`,
          });
        }
        onClose();
      }
    },
    onError: (err: unknown) => {
      toast.error("Action failed", { description: getApiErrorMessage(err) });
    },
  });

  const recoveryMutation = useMutation({
    mutationFn: () => processRecovery(employer!.id),
    onSuccess: () => {
      toast.success("Settlement generated", {
        description: `Due recoveries for ${employer?.companyName} have been grouped into a settlement.`,
      });
      setRecoveryConfirm(false);
      onMutated();
    },
    onError: (err: unknown) => {
      toast.error("Settlement generation failed", { description: getApiErrorMessage(err) });
      setRecoveryConfirm(false);
    },
  });

  if (!open || !employer) return null;

  const isBusy        = mutation.isPending;
  const isRecovering  = recoveryMutation.isPending;
  const canActivate   = employer.status === "PENDING" || employer.status === "INACTIVE";
  const canReactivate = employer.status === "SUSPENDED";
  const canSuspend    = employer.status === "ACTIVE";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[440px] bg-white z-50 flex flex-col border-l border-edge shadow-overlay">
        {/* Header — same as EmployerDetailsDrawer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ink to-[#2A2C45] text-white flex items-center justify-center text-[12px] font-[600]">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-[500] text-ink leading-none">{employer.companyName}</p>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-none">{employer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-[18px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${STATUS_BADGE[employer.status].cls}`}>
              {STATUS_BADGE[employer.status].label}
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
          {/* Company details */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Company details
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Company code", v: <span className="font-mono">{employer.companyCode}</span> },
                { k: "Risk status",  v: <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${RISK_BADGE[employer.riskStatus]}`}>{employer.riskStatus}</span> },
                { k: "Member since", v: new Date(employer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Contact information
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Contact person", v: employer.contactPerson },
                { k: "Email",          v: employer.email          },
                { k: "Phone",          v: employer.phone          },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink truncate max-w-[60%] text-right">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Salary cycle */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Salary cycle configuration
            </p>
            <div className="border border-edge rounded-lg divide-y divide-edge">
              {[
                { k: "Salary date", v: `${employer.payrollDate}th of month`         },
                { k: "Cutoff date",  v: `${employer.payrollCutoffDate}th of month`   },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-ink-3">{k}</span>
                  <span className="text-[11px] font-[500] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Salary advance override */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Salary advance override
            </p>
            <div className="border border-edge rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-edge">
                <span className="text-[11px] text-ink-3">Current override</span>
                <span className="text-[11px] font-[500] text-ink">
                  {saConfig?.maximumAdvanceAmountOverride != null
                    ? `₹${saConfig.maximumAdvanceAmountOverride.toLocaleString("en-IN")}`
                    : <span className="text-ink-4">Platform default</span>}
                </span>
              </div>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">₹</span>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={overrideInput}
                    onChange={e => setOverrideInput(e.target.value)}
                    placeholder="e.g. 7000 (blank = platform default)"
                    className="w-full h-7 pl-5 pr-2 text-[11.5px] border border-edge rounded-md outline-none focus:border-brand bg-white text-ink"
                  />
                </div>
                <button
                  onClick={() => {
                    const raw = overrideInput.trim();
                    const amount = raw === "" ? null : parseInt(raw, 10);
                    if (amount !== null && (isNaN(amount) || amount < 1000)) {
                      toast.error("Minimum override is ₹1,000");
                      return;
                    }
                    overrideMutation.mutate(amount);
                  }}
                  disabled={overrideMutation.isPending}
                  className="h-7 px-3 flex items-center gap-1.5 rounded-md text-[11.5px] font-[600] bg-brand text-white border-none cursor-pointer disabled:opacity-60"
                >
                  <Save size={10} />
                  {overrideMutation.isPending ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="px-3 py-1.5 bg-canvas border-t border-edge-2">
                <p className="text-[10.5px] text-ink-4">
                  Blank = platform default: min(salary×10%, ₹5,000). Hard ceiling of salary×50% always applies.
                </p>
              </div>
            </div>
          </section>

          {/* Recent salary requests */}
          <section>
            <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
              Recent salary requests
            </p>
            {reqLoading ? (
              <div className="border border-edge rounded-lg divide-y divide-edge-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="h-2 w-24 bg-surface-muted rounded animate-pulse" />
                    <div className="h-2 w-16 bg-surface-muted rounded animate-pulse ml-auto" />
                    <div className="h-4 w-14 bg-surface-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="border border-edge rounded-lg px-3 py-4 text-center">
                <p className="text-[11px] text-ink-3">No loan applications found</p>
              </div>
            ) : (
              <div className="border border-edge rounded-lg divide-y divide-edge-2">
                {recentRequests.map(r => {
                  const cfg = SR_STATUS[r.status] ?? { label: r.status, cls: "bg-surface-muted text-ink-3" };
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-[500] text-ink truncate">{r.employee?.name ?? "—"}</p>
                        <p className="text-[11px] text-ink-3">{r.employee?.employeeCode ?? ""}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-[500] text-ink-3 tabular-nums">
                          ₹{Number(r.requestedAmount ?? 0).toLocaleString("en-IN")}
                        </span>
                        <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[11px] font-[500] ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Team — members */}
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={11} className="text-ink-3" />
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3">
                Team members
              </p>
              {!membersLoading && (
                <span className="ml-auto inline-flex h-[15px] px-1.5 rounded-full bg-surface-muted text-[10px] font-[500] text-ink-3 items-center">
                  {members.length}
                </span>
              )}
            </div>
            {membersLoading ? (
              <div className="border border-edge rounded-lg divide-y divide-edge-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="h-2 w-32 bg-surface-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-surface-muted rounded-full animate-pulse ml-auto" />
                    <div className="h-4 w-14 bg-surface-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="border border-edge rounded-lg px-3 py-4 text-center">
                <p className="text-[11px] text-ink-3">No team members</p>
              </div>
            ) : (
              <div className="border border-edge rounded-lg divide-y divide-edge-2">
                {members.map(m => {
                  const statusCls = m.status === "SUSPENDED"
                    ? "bg-warning-bg text-warning-dark"
                    : "bg-success-bg text-success-dark";
                  return (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-[500] text-ink truncate">{m.user.email}</p>
                        <p className="text-[10.5px] text-ink-4">
                          Joined {new Date(m.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[10.5px] font-[500] flex-shrink-0 ${ROLE_BADGE[m.role] ?? "bg-surface-muted text-ink-3"}`}>
                        {m.role}
                      </span>
                      <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[10.5px] font-[500] flex-shrink-0 ${statusCls}`}>
                        {m.status === "SUSPENDED" ? "Suspended" : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Team — pending invites */}
          {(invitesLoading || invites.length > 0) && (
            <section>
              <p className="text-[11px] font-[500] uppercase tracking-[0.07em] text-ink-3 mb-2">
                Pending invites
              </p>
              {invitesLoading ? (
                <div className="border border-edge rounded-lg divide-y divide-edge-2">
                  {[...Array(1)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="h-2 w-32 bg-surface-muted rounded animate-pulse" />
                      <div className="h-4 w-12 bg-surface-muted rounded-full animate-pulse ml-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-edge rounded-lg divide-y divide-edge-2">
                  {invites.map(inv => {
                    const expired = new Date(inv.expiresAt) < new Date();
                    return (
                      <div key={inv.id} className="flex items-center gap-2 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-[500] text-ink truncate">{inv.email}</p>
                          <p className={`text-[10.5px] ${expired ? "text-danger" : "text-ink-4"}`}>
                            {expired ? "Expired" : `Expires ${new Date(inv.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                          </p>
                        </div>
                        <span className={`inline-flex h-[16px] px-1.5 rounded-[3px] items-center text-[10.5px] font-[500] flex-shrink-0 ${ROLE_BADGE[inv.role] ?? "bg-surface-muted text-ink-3"}`}>
                          {inv.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer — actions */}
        {(canActivate || canReactivate || canSuspend) && (
          <div className="border-t border-edge px-5 py-3.5 flex-shrink-0 space-y-2.5">
            <div className="flex gap-2">
              {/* PENDING / INACTIVE → Activate */}
              {canActivate && (
                <button
                  onClick={() => mutation.mutate("ACTIVE")}
                  disabled={isBusy}
                  className="flex-1 h-8 rounded-md bg-ink hover:bg-ink text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  {isBusy ? "Activating…" : "Activate"}
                </button>
              )}
              {/* SUSPENDED → Reactivate */}
              {canReactivate && (
                <button
                  onClick={() => mutation.mutate("ACTIVE")}
                  disabled={isBusy}
                  className="flex-1 h-8 rounded-md bg-ink hover:bg-ink text-[12px] font-[500] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  {isBusy ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  {isBusy ? "Reactivating…" : "Reactivate"}
                </button>
              )}
              {/* ACTIVE → Suspend */}
              {canSuspend && (
                <button
                  onClick={() => setSuspendConfirm(true)}
                  disabled={isBusy}
                  className="h-8 px-3.5 rounded-md border border-edge text-[12px] font-[500] text-ink-3 hover:border-red-200 hover:text-danger transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Ban size={12} />
                  Suspend
                </button>
              )}
            </div>

            {/* Generate settlement — available for any active employer */}
            {canSuspend && (
              <div className="mt-2">
                <button
                  onClick={() => setRecoveryConfirm(true)}
                  disabled={isBusy || isRecovering}
                  className="w-full h-8 rounded-md border border-edge text-[12px] font-[500] text-ink-3 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Generate Settlement
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={suspendConfirm}
        title="Suspend this employer?"
        description={`${employer.companyName}'s employees will lose advance access immediately.`}
        confirmLabel="Suspend"
        loading={isBusy}
        onConfirm={() => mutation.mutate("SUSPENDED")}
        onCancel={() => setSuspendConfirm(false)}
      />

      <ConfirmModal
        open={recoveryConfirm}
        title="Generate settlement?"
        description={`This will create a settlement for all due recoveries for ${employer.companyName}. The employer can then pay MobPae and admin can mark the settlement paid.`}
        confirmLabel="Generate"
        confirmVariant="primary"
        loading={isRecovering}
        onConfirm={() => recoveryMutation.mutate()}
        onCancel={() => setRecoveryConfirm(false)}
      />
    </>
  );
}
