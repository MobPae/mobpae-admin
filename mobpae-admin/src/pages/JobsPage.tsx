import { useQuery } from "@tanstack/react-query";
import { Clock, RefreshCcw, Shield, Zap } from "lucide-react";
import { getHealth } from "../services/healthService";

// ── Static job definitions (backend runs these automatically) ─────────────────

interface JobDef {
  id: string;
  name: string;
  description: string;
  schedule: string;
  scheduleHuman: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const JOBS: JobDef[] = [
  {
    id: "session-cleanup",
    name: "Session Cleanup",
    description: "Removes expired and inactive user sessions from the database. Enforces single active session per user — all stale sessions are purged automatically.",
    schedule: "0 2 * * *",
    scheduleHuman: "Daily at 2:00 AM",
    icon: <Shield size={15} />,
    color: "text-[#7679FF]",
    bg: "bg-[#ECEBFF]",
  },
  {
    id: "token-rotation",
    name: "Token Rotation",
    description: "Refresh tokens rotate on every use and expire after 30 days. Access tokens expire after 15 minutes. No manual intervention needed.",
    schedule: "Per-request",
    scheduleHuman: "On every auth refresh",
    icon: <RefreshCcw size={15} />,
    color: "text-[#7679FF]",
    bg: "bg-[#ECEBFF]",
  },
  {
    id: "password-reset-expiry",
    name: "Password Reset Token Expiry",
    description: "Reset tokens are time-limited to 15 minutes and single-use. Expired tokens are automatically invalidated on next auth request.",
    schedule: "15 min TTL",
    scheduleHuman: "15-minute time-to-live",
    icon: <Clock size={15} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

function timeNow() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function JobsPage() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
    refetchInterval: 30_000,
  });

  const systemOk = health?.status === "ok";

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-[600] text-[#191A2E] tracking-[-0.01em]">Scheduled Jobs</h1>
          <p className="text-[13px] text-[#62657A] mt-0.5">Backend maintenance tasks that run automatically</p>
        </div>
        <div className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md border ${
          healthLoading ? "bg-[#F7F7FB] border-[#E4E4EF]" :
          systemOk      ? "bg-[#ECEBFF] border-[#ECEBFF]" : "bg-red-50 border-red-100"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            healthLoading ? "bg-[#D4D5E0]" : systemOk ? "bg-[#ECEBFF]0" : "bg-red-500"
          }`} />
          <span className={`text-[11px] font-[500] ${
            healthLoading ? "text-[#62657A]" : systemOk ? "text-[#5659D9]" : "text-red-700"
          }`}>
            {healthLoading ? "Checking…" : systemOk ? "System healthy" : "System degraded"}
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-[#ECEBFF] border border-[#E4E4EF] rounded-xl px-4 py-3 flex items-start gap-3">
        <Zap size={14} className="text-[#7679FF] mt-0.5 flex-shrink-0" />
        <p className="text-[12px] text-[#5659D9] leading-relaxed">
          These jobs are managed by the backend runtime. They run automatically on the configured schedule — no manual triggering is needed or supported via this interface. This page reflects the configured schedule only; individual run history is stored in server logs.
        </p>
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {JOBS.map(job => (
          <div key={job.id} className="bg-white border border-[#E4E4EF] rounded-xl p-5 flex items-start gap-4">
            <div className={`w-9 h-9 rounded-xl ${job.bg} ${job.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              {job.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[13px] font-[600] text-[#191A2E]">{job.name}</p>
                <span className="inline-flex items-center gap-1 h-[18px] px-2 rounded-full bg-[#EBF6E3] text-[#3B6D11] text-[11px] font-[500]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4E8A18]" />
                  Active
                </span>
              </div>
              <p className="text-[12px] text-[#62657A] leading-relaxed mb-3">{job.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#62657A]" />
                  <span className="text-[11px] text-[#62657A]">{job.scheduleHuman}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[#62657A] bg-[#F7F7FB] border border-[#E4E4EF] px-1.5 py-0.5 rounded">{job.schedule}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="bg-[#F7F7FB] border border-[#E4E4EF] rounded-xl px-4 py-3">
        <p className="text-[11px] text-[#62657A]">
          Page rendered at {timeNow()}. Job schedules reflect backend configuration at the time of the last deployment.
        </p>
      </div>
    </div>
  );
}
