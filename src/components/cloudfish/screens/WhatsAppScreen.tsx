import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle, Phone, Check, X, Play, Activity, FileText, File as FileIcon,
  Pause, Trash2, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useFiles, formatBytes, createSignedUrl, softDeleteFile, type FileRow } from "@/hooks/useFiles";

type WACategory = "all" | "photos" | "videos" | "documents" | "contact";
type WAClass = "photos" | "videos" | "voice" | "documents";

function classify(f: FileRow): WAClass {
  const t = (f.file_type ?? "").toLowerCase();
  const n = (f.file_name ?? "").toLowerCase();
  if (t.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|bmp)$/.test(n)) return "photos";
  if (t.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/.test(n)) return "videos";
  if (t.startsWith("audio/") || /\.(mp3|wav|ogg|opus|m4a|aac)$/.test(n)) return "voice";
  return "documents";
}

const WA_GREEN = "#25d366";

function useSigned(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); return; }
    createSignedUrl(path, 3600).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [path]);
  return url;
}

function PhotoCell({ f, onOpen }: { f: FileRow; onOpen: (url: string) => void }) {
  const url = useSigned(f.storage_path);
  return (
    <div
      onClick={() => url && onOpen(url)}
      style={{
        aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 6,
        background: "rgba(255,255,255,0.04)", cursor: "pointer",
      }}
    >
      {url ? (
        <img src={url} alt={f.file_name} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : null}
    </div>
  );
}

function VideoCell({ f, onOpen }: { f: FileRow; onOpen: (url: string) => void }) {
  const url = useSigned(f.storage_path);
  return (
    <div
      onClick={() => url && onOpen(url)}
      style={{
        aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 6, position: "relative",
        background: "#0a0e17", cursor: "pointer",
      }}
    >
      {url && (
        <video src={url} muted playsInline preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5))",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.2)",
        }}>
          <Play size={16} color="#fff" fill="#fff" />
        </div>
      </div>
    </div>
  );
}

function FullscreenImage({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <button onClick={onClose} style={{
        position: "fixed", top: 20, left: 20, width: 44, height: 44, borderRadius: 999,
        background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        backdropFilter: "blur(12px)",
      }}>
        <X size={20} />
      </button>
      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
      <img src={url} alt="preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
    </div>
  );
}

function AudioBar({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => { audioRef.current?.play().catch(() => {}); }, [url]);
  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100,
      background: "rgba(8,9,14,0.96)", borderTop: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={(e) => setT((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDur((e.target as HTMLAudioElement).duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={() => {
          const a = audioRef.current; if (!a) return;
          if (a.paused) a.play(); else a.pause();
        }}
        style={{
          width: 36, height: 36, borderRadius: 999, background: WA_GREEN,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0e17",
          flexShrink: 0,
        }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} fill="#0a0e17" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"Inter", sans-serif', fontSize: 12, color: "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{fmt(t)}</span>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${dur ? (t / dur) * 100 : 0}%`, background: WA_GREEN }} />
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{fmt(dur)}</span>
        </div>
      </div>
      <button onClick={onClose} style={{ color: "rgba(255,255,255,0.5)", padding: 4 }}>
        <X size={18} />
      </button>
    </div>
  );
}

type UploadItem = { file: File; pct: number; status: "queued" | "uploading" | "done" | "error" };

export function WhatsAppScreen() {
  const { user } = useAuth();
  const { files } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);
  const [tab, setTab] = useState<WACategory>("all");
  const [preview, setPreview] = useState<string | null>(null);
  const [audio, setAudio] = useState<{ url: string; name: string } | null>(null);
  const [confirmClean, setConfirmClean] = useState<{ ids: string[]; bytes: number } | null>(null);

  const waFiles = useMemo(() => files.filter((f) => f.source === "whatsapp"), [files]);

  const categorized = useMemo(() => {
    const g = { photos: [] as FileRow[], videos: [] as FileRow[], voice: [] as FileRow[], documents: [] as FileRow[] };
    for (const f of waFiles) g[classify(f)].push(f);
    return g;
  }, [waFiles]);

  const counts = {
    all: waFiles.length,
    photos: categorized.photos.length,
    videos: categorized.videos.length,
    voice: categorized.voice.length,
    documents: categorized.documents.length,
  };
  const sizes = {
    photos: categorized.photos.reduce((s, f) => s + (f.file_size || 0), 0),
    videos: categorized.videos.reduce((s, f) => s + (f.file_size || 0), 0),
    voice: categorized.voice.reduce((s, f) => s + (f.file_size || 0), 0),
    total: waFiles.reduce((s, f) => s + (f.file_size || 0), 0),
  };

  // Group files uploaded within ~2 minutes of each other into a "batch"
  const batches = useMemo(() => {
    const sorted = [...waFiles].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const groups: { key: string; label: string; files: FileRow[]; bytes: number; date: Date }[] = [];
    const WINDOW = 2 * 60 * 1000;
    for (const f of sorted) {
      const t = new Date(f.created_at).getTime();
      const last = groups[groups.length - 1];
      if (last && t - new Date(last.files[last.files.length - 1].created_at).getTime() <= WINDOW) {
        last.files.push(f);
        last.bytes += f.file_size || 0;
      } else {
        const d = new Date(f.created_at);
        groups.push({
          key: f.created_at,
          label: `Backup — ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`,
          files: [f],
          bytes: f.file_size || 0,
          date: d,
        });
      }
    }
    return groups.reverse();
  }, [waFiles]);

  const [activeBatch, setActiveBatch] = useState<string | null>(null);


  const openPicker = () => fileInputRef.current?.click();

  const onFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0 || !user) return;
    const arr = Array.from(list);
    e.target.value = "";
    setUploadedCount(null);
    const initial: UploadItem[] = arr.map((f) => ({ file: f, pct: 0, status: "queued" }));
    setUploads((q) => [...initial, ...q]);
    let ok = 0;
    for (const f of arr) {
      const path = `${user.id}/whatsapp/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, "_")}`;
      setUploads((q) => q.map((it) => (it.file === f ? { ...it, status: "uploading", pct: 20 } : it)));
      try {
        const { error: upErr } = await supabase.storage
          .from("user-files")
          .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type || undefined });
        if (upErr) throw upErr;
        setUploads((q) => q.map((it) => (it.file === f ? { ...it, pct: 80 } : it)));
        const { error: dbErr } = await supabase.from("file_metadata").insert({
          user_id: user.id,
          file_name: f.name,
          file_size: f.size,
          file_type: f.type || null,
          storage_path: path,
          source: "whatsapp",
          last_modified: new Date(f.lastModified).toISOString(),
        });
        if (dbErr) throw dbErr;
        setUploads((q) => q.map((it) => (it.file === f ? { ...it, status: "done", pct: 100 } : it)));
        ok++;
      } catch (err: any) {
        setUploads((q) => q.map((it) => (it.file === f ? { ...it, status: "error", pct: 100 } : it)));
        toast.error(`${f.name}: ${err?.message ?? "Upload failed"}`);
      }
    }
    setUploadedCount(ok);
    if (ok > 0) toast.success(`${ok} file${ok === 1 ? "" : "s"} organized from WhatsApp`);
  };

  const findDuplicates = () => {
    const byName = new Map<string, FileRow[]>();
    for (const f of waFiles) {
      const arr = byName.get(f.file_name) ?? [];
      arr.push(f);
      byName.set(f.file_name, arr);
    }
    const dupIds: string[] = [];
    let freed = 0;
    for (const arr of byName.values()) {
      if (arr.length < 2) continue;
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      for (let i = 1; i < arr.length; i++) {
        dupIds.push(arr[i].id);
        freed += arr[i].file_size || 0;
      }
    }
    if (dupIds.length === 0) {
      toast.info("No duplicates found");
      return;
    }
    setConfirmClean({ ids: dupIds, bytes: freed });
  };

  const runClean = async () => {
    if (!confirmClean) return;
    const targets = waFiles.filter((f) => confirmClean.ids.includes(f.id));
    for (const f of targets) await softDeleteFile(f.id, f.storage_path);
    toast.success(`Removed ${targets.length} duplicate${targets.length === 1 ? "" : "s"}`);
    setConfirmClean(null);
  };

  const TABS: { id: WACategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "photos", label: "Photos" },
    { id: "videos", label: "Videos" },
    { id: "documents", label: "Documents" },
    { id: "contact", label: "By Contact" },
  ];

  const tabCount = (id: WACategory): number => {
    if (id === "contact") return batches.length;
    return counts[id as keyof typeof counts];
  };

  const filesInBatch = (batchKey: string | null): FileRow[] => {
    if (!batchKey) return [];
    const b = batches.find((x) => x.key === batchKey);
    return b ? b.files : [];
  };

  const empty = waFiles.length === 0;

  return (
    <div className="space-y-6" style={{ paddingBottom: audio ? 88 : 0 }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
        style={{ display: "none" }}
        onChange={onFilesPicked}
      />

      {/* Banner */}
      <div style={{
        background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)",
        borderRadius: 14, padding: 20,
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 999, background: WA_GREEN,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Phone size={18} color="#0a0e17" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, fontSize: 16, color: "#fff" }}>
              Connect WhatsApp Media
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginTop: 4 }}>
              Export your WhatsApp media and upload it here. VaultFish will organize all your photos, videos, documents, and voice notes automatically.
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 12, lineHeight: 1.8 }}>
              <div>1. Open WhatsApp → Settings → Chats → Chat Backup → Export</div>
              <div>2. Save the exported files to your phone or computer</div>
              <div>3. Upload them below — VaultFish does the rest</div>
            </div>
          </div>
        </div>
        <button
          onClick={openPicker}
          style={{
            marginTop: 16, width: "100%", height: 48, borderRadius: 12,
            background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)",
            color: WA_GREEN, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 600, fontSize: 14,
          }}
        >
          Select WhatsApp Export Files
        </button>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div style={{
          background: "rgba(14,17,24,0.95)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600, fontSize: 14, color: "#fff" }}>
              {uploadedCount !== null ? `${uploadedCount} files organized from WhatsApp` : "Uploading WhatsApp media..."}
            </div>
            {uploadedCount !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: WA_GREEN, fontSize: 12 }}>
                <Check size={16} /> Done
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {uploads.map((it, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, gap: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{it.file.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{formatBytes(it.file.size)}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${it.pct}%`,
                    background: it.status === "error" ? "#ef4444" : WA_GREEN,
                    transition: "width 200ms ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {empty ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px", textAlign: "center" }}>
          <Phone size={48} color={WA_GREEN} style={{ opacity: 0.3 }} />
          <div style={{ marginTop: 16, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            No WhatsApp media yet
          </div>
          <div style={{ marginTop: 6, fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 320 }}>
            Export and upload your WhatsApp media to see it organized here
          </div>
          <button
            onClick={openPicker}
            style={{
              marginTop: 20, padding: "0 20px", height: 44, borderRadius: 12,
              background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)",
              color: WA_GREEN, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 600, fontSize: 13,
            }}
          >
            Select WhatsApp Export Files
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              const c = tabCount(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap",
                    fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: active ? 600 : 500,
                    background: active ? WA_GREEN : "rgba(255,255,255,0.05)",
                    border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                    color: active ? "#0a0e17" : "rgba(255,255,255,0.6)",
                    flexShrink: 0,
                  }}
                >
                  {t.label} <span style={{ opacity: 0.7 }}>· {c}</span>
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
            {[
              { label: "Total Files", value: counts.all },
              { label: "Photos", value: counts.photos },
              { label: "Storage Used", value: formatBytes(sizes.total) },
              { label: "Videos", value: counts.videos },
            ].map((s) => (
              <div key={s.label} style={{
                minWidth: 140, flex: "1 1 140px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, fontSize: 24, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* By Contact — batches by upload session */}
          {tab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {batches.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  No upload batches yet.
                </div>
              )}
              {batches.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActiveBatch(b.key)}
                  className="vf-wa-batch-card"
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: 14, textAlign: "left", width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 999, background: "rgba(37,211,102,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <MessageCircle size={20} color={WA_GREEN} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      {b.files.length} file{b.files.length === 1 ? "" : "s"} · {formatBytes(b.bytes)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Content per tab */}
          {(tab === "all" || tab === "photos") && categorized.photos.length > 0 && (
            <div>
              {tab === "all" && <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Photos</div>}
              <div className="vf-wa-photo-grid">
                {categorized.photos.map((f) => (
                  <PhotoCell key={f.id} f={f} onOpen={setPreview} />
                ))}
              </div>
            </div>
          )}

          {(tab === "all" || tab === "videos") && categorized.videos.length > 0 && (
            <div>
              {tab === "all" && <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Videos</div>}
              <div className="vf-wa-photo-grid">
                {categorized.videos.map((f) => (
                  <VideoCell key={f.id} f={f} onOpen={(url) => setPreview(url)} />
                ))}
              </div>
            </div>
          )}

          {tab === "all" && categorized.voice.length > 0 && (
            <div>
              {tab === "all" && <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Voice Notes</div>}
              <div style={{
                background: "rgba(13,15,22,0.72)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden",
              }}>
                {categorized.voice.map((f, i) => (
                  <div
                    key={f.id}
                    style={{
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                      borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                    }}
                    onClick={async () => {
                      if (!f.storage_path) return;
                      const url = await createSignedUrl(f.storage_path, 3600);
                      if (url) setAudio({ url, name: f.file_name });
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 999, background: "rgba(37,211,102,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Activity size={16} color={WA_GREEN} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.file_name}
                      </div>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {formatBytes(f.file_size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(tab === "all" || tab === "documents") && categorized.documents.length > 0 && (
            <div>
              {tab === "all" && <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Documents</div>}
              <div style={{
                background: "rgba(13,15,22,0.72)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden",
              }}>
                {categorized.documents.map((f, i) => {
                  const isPdf = /pdf|doc/.test((f.file_type ?? "") + f.file_name.toLowerCase());
                  const Icon = isPdf ? FileText : FileIcon;
                  return (
                    <div
                      key={f.id}
                      onClick={async () => {
                        if (!f.storage_path) return;
                        const url = await createSignedUrl(f.storage_path, 3600);
                        if (url) window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      style={{
                        padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                        borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "rgba(37,211,102,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={16} color={WA_GREEN} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.file_name}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                          {formatBytes(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage insight */}
          <div style={{
            background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.15)",
            borderRadius: 14, padding: 18,
          }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600, fontSize: 14, color: WA_GREEN }}>
              Your WhatsApp storage breakdown
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Photos", n: counts.photos, b: sizes.photos },
                { label: "Videos", n: counts.videos, b: sizes.videos },
                { label: "Voice Notes", n: counts.voice, b: sizes.voice },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{r.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                    {r.n} files · {formatBytes(r.b)}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={findDuplicates}
              style={{
                marginTop: 14, width: "100%", height: 40, borderRadius: 10,
                background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)",
                color: WA_GREEN, fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Sparkles size={14} /> Clean duplicates
            </button>
          </div>
        </>
      )}

      {preview && <FullscreenImage url={preview} onClose={() => setPreview(null)} />}
      {audio && <AudioBar url={audio.url} name={audio.name} onClose={() => setAudio(null)} />}

      {confirmClean && (
        <div
          onClick={() => setConfirmClean(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0e1118", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 20, maxWidth: 360, width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, fontSize: 15, color: "#fff" }}>
                  Remove {confirmClean.ids.length} duplicate{confirmClean.ids.length === 1 ? "" : "s"}?
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                  This frees {formatBytes(confirmClean.bytes)}. Keeps the most recent copy of each file.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setConfirmClean(null)} style={{ flex: 1, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={runClean} style={{ flex: 1, height: 40, borderRadius: 10, background: WA_GREEN, color: "#0a0e17", fontSize: 13, fontWeight: 600 }}>
                Clean up
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vf-wa-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
        @media (min-width: 768px) {
          .vf-wa-photo-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}
