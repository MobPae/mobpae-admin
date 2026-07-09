import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Pencil, RefreshCw, X } from "lucide-react";
import {
  getAppInformation,
  upsertAppInformation,
  updateAppInformation,
  type AppInformation,
  type AppInfoType,
} from "../services/appInformationService";

// ── constants ─────────────────────────────────────────────────────────────────

const P  = "#315eff";
const T1 = "#111827";
const T2 = "#6B7280";
const T3 = "#9CA3AF";

const TYPE_META: Record<AppInfoType, { label: string; description: string }> = {
  ABOUT:            { label: "About",             description: "App description shown in Profile > About" },
  PRIVACY_POLICY:   { label: "Privacy Policy",    description: "Full privacy policy text" },
  TERMS_CONDITIONS: { label: "Terms & Conditions",description: "Terms of service" },
  HOW_IT_WORKS:     { label: "How It Works",      description: "Step-by-step guide shown in app" },
  FAQ:              { label: "FAQ",               description: "Frequently asked questions" },
  CONTACT:          { label: "Contact Us",        description: "Support contact information" },
  WHATS_NEW:        { label: "What's New",        description: "Release notes / changelog" },
};

const ALL_TYPES = Object.keys(TYPE_META) as AppInfoType[];

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── editor drawer ─────────────────────────────────────────────────────────────

interface EditorProps {
  entry: AppInformation | null;
  type: AppInfoType;
  onClose: () => void;
  onSaved: () => void;
}

function EditorDrawer({ entry, type, onClose, onSaved }: EditorProps) {
  const meta = TYPE_META[type];
  const [title,   setTitle]   = useState(entry?.title   ?? meta.label);
  const [content, setContent] = useState(entry?.content ?? "");
  const [version, setVersion] = useState(entry?.version ?? "");
  const [isActive, setIsActive] = useState(entry?.isActive ?? true);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: async () => {
      if (entry) {
        return updateAppInformation(entry.id, { title, content, version: version || undefined, isActive });
      }
      return upsertAppInformation({ type, title, content, version: version || undefined, isActive });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["app-information"] });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); }, 800);
    },
  });

  const isBusy = save.isPending;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      {/* Overlay */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 560,
        background: "white", display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              {entry ? "Edit" : "Create"} · {type.replace(/_/g, " ")}
            </p>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T1, margin: "3px 0 0" }}>{meta.label}</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T2 }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontSize: 12, color: T3, margin: 0 }}>{meta.description}</p>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T2, display: "block", marginBottom: 6 }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", height: 38, padding: "0 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, color: T1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          {/* Version (optional) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T2, display: "block", marginBottom: 6 }}>
              Version <span style={{ fontWeight: 400, color: T3 }}>(optional — e.g. 1.2.0)</span>
            </label>
            <input
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="e.g. 1.2.0"
              style={{ width: "100%", height: 38, padding: "0 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, color: T1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T2, display: "block", marginBottom: 6 }}>Content</label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter content here…"
              style={{
                width: "100%", minHeight: 280, padding: "12px", border: "1.5px solid #E5E7EB",
                borderRadius: 8, fontSize: 13, color: T1, outline: "none",
                boxSizing: "border-box", fontFamily: "inherit", resize: "vertical",
                lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: 11, color: T3, marginTop: 4 }}>{content.length} characters</p>
          </div>

          {/* Active toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setIsActive(v => !v)}
              style={{
                width: 40, height: 22, borderRadius: 999,
                background: isActive ? P : "#E5E7EB",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <span style={{
                display: "inline-block", width: 18, height: 18, borderRadius: "50%",
                background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                position: "absolute", top: 2, left: isActive ? 20 : 2,
                transition: "left 0.2s",
              }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? T1 : T3 }}>
              {isActive ? "Active (visible in app)" : "Inactive (hidden from app)"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => save.mutate()}
            disabled={isBusy || !title.trim() || !content.trim()}
            style={{
              height: 38, padding: "0 20px", borderRadius: 9, border: "none",
              background: saved ? "#16A34A" : P,
              color: "white", fontSize: 13, fontWeight: 700,
              cursor: isBusy || !title.trim() || !content.trim() ? "not-allowed" : "pointer",
              opacity: !title.trim() || !content.trim() ? 0.5 : 1,
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7,
              transition: "background 0.2s",
            }}
          >
            {saved ? <><Check size={14} />Saved</> : isBusy ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "white", color: T2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel
          </button>
          {save.isError && (
            <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>Failed to save. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── card ──────────────────────────────────────────────────────────────────────

function InfoCard({
  type,
  entry,
  onEdit,
  onToggle,
  toggling,
}: {
  type: AppInfoType;
  entry?: AppInformation;
  onEdit: () => void;
  onToggle: () => void;
  toggling: boolean;
}) {
  const meta = TYPE_META[type];
  const [expanded, setExpanded] = useState(false);
  const exists = Boolean(entry);
  const active = entry?.isActive ?? false;

  return (
    <div style={{
      background: "white", borderRadius: 14, border: `1.5px solid ${exists ? "#E5E7EB" : "#F3F4F6"}`,
      overflow: "hidden", transition: "box-shadow 0.15s",
    }}>
      {/* Card header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Status dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: !exists ? T3 : active ? "#16A34A" : "#F59E0B",
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T1, margin: 0 }}>{meta.label}</p>
            {entry?.version && (
              <span style={{ fontSize: 11, fontWeight: 600, color: P, background: "#EEF2FF", padding: "1px 7px", borderRadius: 999 }}>
                v{entry.version}
              </span>
            )}
            {!exists && (
              <span style={{ fontSize: 11, fontWeight: 600, color: T3, background: "#F3F4F6", padding: "1px 7px", borderRadius: 999 }}>
                Not created
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: T3, margin: "2px 0 0" }}>
            {exists
              ? `Updated ${timeAgo(entry!.updatedAt)} · ${entry!.content.length} chars`
              : meta.description}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Toggle active */}
          {exists && (
            <button
              onClick={onToggle}
              disabled={toggling}
              title={active ? "Deactivate" : "Activate"}
              style={{
                width: 30, height: 30, borderRadius: 8, border: "1px solid #E5E7EB",
                background: "white", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: toggling ? "not-allowed" : "pointer", color: active ? "#16A34A" : T3,
                opacity: toggling ? 0.5 : 1,
              }}
            >
              {active ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          {/* Edit */}
          <button
            onClick={onEdit}
            style={{
              height: 30, padding: "0 12px", borderRadius: 8,
              border: "none", background: exists ? "#EEF2FF" : P,
              color: exists ? P : "white",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {exists ? <><Pencil size={11} />Edit</> : "Create"}
          </button>
          {/* Expand */}
          {exists && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E5E7EB", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T2 }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && entry && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "16px 20px", background: "#FAFAFA" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T3, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Content preview
          </p>
          <p style={{ fontSize: 13, color: T2, margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7, maxHeight: 200, overflowY: "auto" }}>
            {entry.content}
          </p>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export function AppInformationPage() {
  const [editing, setEditing] = useState<AppInfoType | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const qc = useQueryClient();

  const { data: entries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["app-information"],
    queryFn: getAppInformation,
  });

  const entryByType = (type: AppInfoType) =>
    entries.find(e => e.type === type);

  const handleToggle = async (entry: AppInformation) => {
    setToggling(entry.id);
    try {
      await updateAppInformation(entry.id, { isActive: !entry.isActive });
      void qc.invalidateQueries({ queryKey: ["app-information"] });
    } finally {
      setToggling(null);
    }
  };

  const activeCount  = entries.filter(e => e.isActive).length;
  const missingTypes = ALL_TYPES.filter(t => !entryByType(t));

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#F8F8FC" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T1, margin: 0 }}>App Information</h1>
          <p style={{ fontSize: 13, color: T2, marginTop: 4 }}>
            Manage content shown in the employee app — About, FAQ, Privacy Policy, Terms, and more.
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E5E7EB", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T3 }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total sections",   value: ALL_TYPES.length,                color: T1       },
          { label: "Active",           value: activeCount,                      color: "#16A34A" },
          { label: "Inactive",         value: entries.filter(e => !e.isActive).length, color: "#F59E0B" },
          { label: "Not created yet",  value: missingTypes.length,              color: T3       },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "14px 20px", border: "1px solid #F3F4F6", minWidth: 130 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11.5, color: T3, margin: "2px 0 0", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* States */}
      {isError && (
        <div style={{ background: "white", borderRadius: 14, padding: "40px 24px", textAlign: "center", border: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>Failed to load app information</p>
          <button onClick={() => void refetch()} style={{ marginTop: 12, height: 32, padding: "0 16px", borderRadius: 8, border: "none", background: P, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      )}

      {isLoading && (
        <div style={{ background: "white", borderRadius: 14, padding: "40px 24px", textAlign: "center", border: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 13, color: T3, margin: 0 }}>Loading…</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ALL_TYPES.map(type => (
            <InfoCard
              key={type}
              type={type}
              entry={entryByType(type)}
              onEdit={() => setEditing(type)}
              onToggle={() => { const e = entryByType(type); if (e) void handleToggle(e); }}
              toggling={toggling === entryByType(type)?.id}
            />
          ))}
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <EditorDrawer
          entry={entryByType(editing) ?? null}
          type={editing}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}
    </div>
  );
}
