import { useEffect, useMemo, useState } from "react";
import { History, RotateCcw, CameraIcon, Loader2, Check } from "lucide-react";
import { SectionTitle } from "../ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useFiles, formatBytes, timeAgo, PROVIDER_LABEL, type FileRow } from "@/hooks/useFiles";

type VersionRow = {
  id: string;
  file_id: string;
  version_no: number;
  filename: string;
  size_bytes: number;
  storage_path: string | null;
  source_provider: string;
  is_current: boolean;
  note: string | null;
  created_at: string;
};

export function VersionsScreen() {
  const { user } = useAuth();
  const { files } = useFiles();
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("file_versions")
      .select("*")
      .eq("user_id", user.id)
      .order("version_no", { ascending: false });
    setVersions((data as VersionRow[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const byFile = useMemo(() => {
    const m = new Map<string, VersionRow[]>();
    versions.forEach((v) => m.set(v.file_id, [...(m.get(v.file_id) ?? []), v]));
    return m;
  }, [versions]);

  const snapshot = async (f: FileRow) => {
    if (!user) return;
    setBusy(f.id);
    const existing = byFile.get(f.id) ?? [];
    const nextNo = (existing[0]?.version_no ?? 0) + 1;
    await supabase.from("file_versions").update({ is_current: false }).eq("file_id", f.id);
    await supabase.from("file_versions").insert({
      user_id: user.id,
      file_id: f.id,
      version_no: nextNo,
      filename: f.filename,
      size_bytes: Number(f.size_bytes ?? 0),
      storage_path: f.storage_path,
      source_provider: f.source_provider,
      is_current: true,
      note: `Snapshot taken from ${PROVIDER_LABEL[f.source_provider] ?? f.source_provider}`,
    });
    await load();
    setBusy(null);
    setNote(`Version ${nextNo} saved for ${f.filename}`);
    setTimeout(() => setNote(null), 2500);
  };

  const restore = async (v: VersionRow) => {
    setBusy(v.file_id);
    await supabase
      .from("files")
      .update({ filename: v.filename, size_bytes: v.size_bytes, storage_path: v.storage_path })
      .eq("id", v.file_id);
    await supabase.from("file_versions").update({ is_current: false }).eq("file_id", v.file_id);
    await supabase.from("file_versions").update({ is_current: true }).eq("id", v.id);
    await load();
    setBusy(null);
    setNote(`Restored version ${v.version_no}`);
    setTimeout(() => setNote(null), 2500);
  };

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <SectionTitle sub="One version timeline for every file — no matter which cloud it lives in">
        Version History
      </SectionTitle>

      {note && (
        <div className="flex items-center gap-2" style={{ fontSize: 13, color: "#34d399" }}>
          <Check size={15} /> {note}
        </div>
      )}

      {files.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "32px 0" }}>
          No files yet. Upload something and VaultFish will start tracking versions.
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 8 }}>
        {files.map((f) => {
          const list = byFile.get(f.id) ?? [];
          const expanded = open === f.id;
          return (
            <div
              key={f.id}
              style={{
                borderRadius: 14,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center gap-3" style={{ padding: "12px 14px" }}>
                <History size={16} style={{ color: "#a78bfa" }} />
                <button onClick={() => setOpen(expanded ? null : f.id)} className="min-w-0 text-left" style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.filename}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                    {PROVIDER_LABEL[f.source_provider] ?? f.source_provider} · {formatBytes(Number(f.size_bytes))} · {list.length} version{list.length === 1 ? "" : "s"}
                  </div>
                </button>
                <button
                  onClick={() => snapshot(f)}
                  disabled={busy === f.id}
                  className="flex items-center gap-1.5 shrink-0"
                  style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(167,139,250,0.16)", color: "#a78bfa", fontSize: 12, fontWeight: 600 }}
                >
                  {busy === f.id ? <Loader2 size={13} className="animate-spin" /> : <CameraIcon size={13} />} Snapshot
                </button>
              </div>

              {expanded && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 14px 12px" }}>
                  {list.length === 0 && (
                    <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "8px 0" }}>
                      No snapshots yet — take one to start the timeline.
                    </div>
                  )}
                  {list.map((v) => (
                    <div key={v.id} className="flex items-center gap-3" style={{ padding: "8px 0" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: v.is_current ? "rgba(45,212,191,0.16)" : "rgba(255,255,255,0.06)",
                          color: v.is_current ? "#2dd4bf" : "var(--muted)",
                        }}
                      >
                        v{v.version_no}
                      </span>
                      <div className="min-w-0" style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.filename}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {formatBytes(Number(v.size_bytes))} · {timeAgo(v.created_at)}
                        </div>
                      </div>
                      {!v.is_current && (
                        <button
                          onClick={() => restore(v)}
                          className="flex items-center gap-1.5 shrink-0"
                          style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(77,144,254,0.14)", color: "#4d90fe", fontSize: 11.5, fontWeight: 600 }}
                        >
                          <RotateCcw size={12} /> Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
