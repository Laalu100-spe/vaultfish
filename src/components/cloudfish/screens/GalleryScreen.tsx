import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Play, Plus } from "lucide-react";
import { useFiles, categorizeFile, createSignedUrl, type FileRow } from "@/hooks/useFiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useConnectedAccounts } from "@/hooks/useConnectedAccounts";
import { ProviderBadge } from "../ProviderBadge";
import { MediaViewer } from "../MediaViewer";

type FilterTab = "all" | "photos" | "videos";

type Media = { id: string; row: FileRow; url: string; kind: "image" | "video" };

function useSignedMedia(files: FileRow[]) {
  const [media, setMedia] = useState<Media[]>([]);
  useEffect(() => {
    let cancelled = false;
    const media$ = files.filter((f) => {
      const c = categorizeFile(f);
      return (c === "photos" || c === "videos") && (!!f.storage_path || !!f.thumbnail_url || f.source_provider === "google_drive");
    });
    (async () => {
      const items = await Promise.all(
        media$.map(async (f) => {
          const url = f.thumbnail_url ?? (f.storage_path ? await createSignedUrl(f.storage_path, 3600) : null);
          return url ? { id: f.id, row: f, url, kind: categorizeFile(f) === "videos" ? "video" : "image" as const } : null;
        }),
      );
      if (!cancelled) setMedia(items.filter(Boolean) as Media[]);
    })();
    return () => { cancelled = true; };
  }, [files]);
  return media;
}

const SWIPE_DISMISS = 140;
const SWIPE_NAV = 90;
const MAX_ZOOM = 8;

export function GalleryScreen() {
  const { user } = useAuth();
  const { files, loading } = useFiles();
  const { accounts } = useConnectedAccounts();
  const allMedia = useSignedMedia(files);
  const [tab, setTab] = useState<FilterTab>("all");
  const media = useMemo(() => {
    if (tab === "photos") return allMedia.filter((m) => m.kind === "image");
    if (tab === "videos") return allMedia.filter((m) => m.kind === "video");
    return allMedia;
  }, [allMedia, tab]);
  const counts = useMemo(() => ({
    all: allMedia.length,
    photos: allMedia.filter((m) => m.kind === "image").length,
    videos: allMedia.filter((m) => m.kind === "video").length,
  }), [allMedia]);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerFileId, setViewerFileId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onUploadClick = () => uploadInputRef.current?.click();
  const onFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files; if (!list || !user) return;
    const arr = Array.from(list); e.target.value = "";
    setUploading(true);
    try {
      for (const f of arr) {
        const path = `${user.id}/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error } = await supabase.storage.from("user-files").upload(path, f, { upsert: false, contentType: f.type });
        if (error) { toast.error(`${f.name}: ${error.message}`); continue; }
        await supabase.from("files").insert({
          user_id: user.id, filename: f.name, size_bytes: f.size,
          file_type: f.type || null, storage_path: path,
        });
      }
      toast.success(`Uploaded ${arr.length} item${arr.length === 1 ? "" : "s"}`);
    } finally { setUploading(false); }
  };


  if (loading) return <div className="text-muted text-sm">Loading gallery…</div>;

  const emptyState = (
    <div className="flex flex-col items-center text-center py-20">
      <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Camera size={48} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
      </div>
      <div style={{ marginTop: 16, fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: "#fff" }}>No photos yet</div>
      <div style={{ marginTop: 6, fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Upload images using the Upload button</div>
      <button
        onClick={onUploadClick}
        disabled={uploading}
        className="mt-5"
        style={{ background: "#4d90fe", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, fontFamily: '"Inter", sans-serif' }}
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      <input ref={uploadInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFilesPicked} />

      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Gallery</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{media.length} items</p>
        </div>
      </div>

      <div className="mb-4 flex gap-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {(["all", "photos", "videos"] as FilterTab[]).map((t) => {
          const active = tab === t;
          const label = t === "all" ? "All" : t === "photos" ? "Photos" : "Videos";
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative"
              style={{
                fontFamily: '"Inter", sans-serif', fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                padding: "10px 2px", background: "transparent",
              }}
            >
              {label} <span style={{ opacity: 0.6, marginLeft: 4 }}>· {counts[t]}</span>
              {active && (
                <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#4d90fe" }} />
              )}
            </button>
          );
        })}
      </div>

      {media.length === 0 ? emptyState : (
        <div
          role="grid"
          aria-label="Photo grid"
          className="vf-gallery-grid"
        >
          {media.map((m, i) => (
            <motion.button
              key={m.id}
              layoutId={`vf-photo-${m.id}`}
              onClick={() => setViewerFileId(m.id)}
              className="relative overflow-hidden bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 vf-gallery-cell"
              whileTap={{ scale: 0.97 }}
              aria-label={`Open ${m.row.filename}`}
            >
              <img src={m.url} alt={m.row.filename} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <span className="absolute top-2 right-2"><ProviderBadge file={m.row} accounts={accounts} compact /></span>
              {m.kind === "video" && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <Play size={22} color="#fff" fill="#fff" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <button
          onClick={onUploadClick}
          aria-label="Upload photos or videos"
          className="fixed"
          style={{
            right: 20, bottom: "calc(84px + env(safe-area-inset-bottom))",
            width: 52, height: 52, borderRadius: 999,
            background: "#4d90fe", color: "#fff",
            boxShadow: "0 4px 20px rgba(77,144,254,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 40, border: "none",
          }}
        >
          <Plus size={24} color="#fff" />
        </button>
      )}
      {viewerFileId && <MediaViewer files={media.map((item) => item.row)} initialFileId={viewerFileId} accounts={accounts} onClose={() => setViewerFileId(null)} />}
    </div>
  );
}
