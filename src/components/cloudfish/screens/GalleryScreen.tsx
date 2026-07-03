import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, Camera, Play, X, Share2, Trash2, Download, Plus } from "lucide-react";
import { useFiles, categorizeFile, createSignedUrl, softDeleteFile, type FileRow } from "@/hooks/useFiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type FilterTab = "all" | "photos" | "videos";

type Media = { id: string; row: FileRow; url: string; kind: "image" | "video" };

function useSignedMedia(files: FileRow[]) {
  const [media, setMedia] = useState<Media[]>([]);
  useEffect(() => {
    let cancelled = false;
    const media$ = files.filter((f) => {
      const c = categorizeFile(f);
      return (c === "photos" || c === "videos") && !!f.storage_path;
    });
    (async () => {
      const items = await Promise.all(
        media$.map(async (f) => {
          const url = await createSignedUrl(f.storage_path!, 3600);
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
  const { files, loading } = useFiles();
  const media = useSignedMedia(files);
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dismissScale = useTransform(dragY, [0, 300], [1, 0.82]);
  const bgOpacity = useTransform(dragY, [0, 260], [1, 0.35]);

  const current = index !== null ? media[index] : null;
  const canNav = scale <= 1.02;

  const close = useCallback(() => {
    setIndex(null);
    setScale(1);
    setPan({ x: 0, y: 0 });
    dragX.set(0); dragY.set(0);
  }, [dragX, dragY]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      const nxt = index + dir;
      if (nxt < 0 || nxt >= media.length) return;
      setIndex(nxt);
      setScale(1);
      setPan({ x: 0, y: 0 });
      dragX.set(0); dragY.set(0);
    },
    [index, media.length, dragX, dragY],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "0") { setScale(1); setPan({ x: 0, y: 0 }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, go]);

  // Auto-center active thumbnail
  useEffect(() => {
    if (index === null || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-idx="${index}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  // Preload neighbours
  useEffect(() => {
    if (index === null) return;
    [index - 1, index + 1].forEach((i) => {
      const m = media[i]; if (m && m.kind === "image") { const img = new Image(); img.src = m.url; }
    });
  }, [index, media]);

  const onWheel = (e: React.WheelEvent) => {
    if (index === null) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale((s) => Math.max(1, Math.min(MAX_ZOOM, s - e.deltaY * 0.01)));
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1.05) { setScale(1); setPan({ x: 0, y: 0 }); }
    else setScale(2.5);
    e.stopPropagation();
  };

  // Pinch state
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinchRef.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ns = Math.max(1, Math.min(MAX_ZOOM, pinchRef.current.scale * (d / pinchRef.current.dist)));
      setScale(ns);
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => { if (e.touches.length < 2) pinchRef.current = null; };

  const share = async (row: FileRow) => {
    if (!row.storage_path) return;
    const url = await createSignedUrl(row.storage_path, 60 * 60 * 24 * 7);
    if (!url) return toast.error("Could not create link");
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const download = async (row: FileRow) => {
    if (!row.storage_path) return;
    const url = await createSignedUrl(row.storage_path, 300);
    if (!url) return;
    const a = document.createElement("a"); a.href = url; a.download = row.file_name; document.body.appendChild(a); a.click(); a.remove();
  };

  const del = async (row: FileRow) => {
    close();
    await softDeleteFile(row.id, row.storage_path);
    toast.success("Deleted");
  };

  if (loading) return <div className="text-muted text-sm">Loading gallery…</div>;

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-20">
        <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(77,144,254,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageIcon size={30} color="#4d90fe" strokeWidth={1.5} />
        </div>
        <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: "#fff" }}>No photos or videos yet</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Upload media to see it here</div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Gallery</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{media.length} items</p>
        </div>
      </div>

      <div
        role="grid"
        aria-label="Photo grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 3 }}
      >
        {media.map((m, i) => (
          <motion.button
            key={m.id}
            layoutId={`vf-photo-${m.id}`}
            onClick={() => setIndex(i)}
            className="relative overflow-hidden bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            style={{ aspectRatio: "1/1", borderRadius: 4, cursor: "zoom-in" }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Open ${m.row.file_name}`}
          >
            <img src={m.url} alt={m.row.file_name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {m.kind === "video" && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
                <Play size={22} color="#fff" fill="#fff" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key="viewer"
            className="fixed inset-0 z-[9000] select-none"
            style={{ background: "#000" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onWheel={onWheel}
          >
            <motion.div className="absolute inset-0" style={{ opacity: bgOpacity, background: "#000" }} />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between" style={{ padding: "16px 16px", paddingTop: "calc(16px + env(safe-area-inset-top))" }}>
              <button
                onClick={close}
                className="flex items-center justify-center"
                aria-label="Back to gallery"
                style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
              >
                <ChevronLeft size={22} color="#fff" />
              </button>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
                {(index ?? 0) + 1} / {media.length}
              </div>
              <div className="flex gap-2">
                <IconGlass onClick={() => download(current.row)} label="Download"><Download size={18} color="#fff" /></IconGlass>
                <IconGlass onClick={() => share(current.row)} label="Share"><Share2 size={18} color="#fff" /></IconGlass>
                <IconGlass onClick={() => del(current.row)} label="Delete"><Trash2 size={18} color="#f87171" /></IconGlass>
                <IconGlass onClick={close} label="Close"><X size={18} color="#fff" /></IconGlass>
              </div>
            </div>

            {/* Photo stage */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ x: dragX, y: dragY, scale: dismissScale }}
              drag={canNav}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                const { offset, velocity } = info;
                if (offset.y > SWIPE_DISMISS || velocity.y > 800) return close();
                if (offset.x < -SWIPE_NAV || velocity.x < -600) return go(1);
                if (offset.x > SWIPE_NAV || velocity.x > 600) return go(-1);
                dragX.set(0); dragY.set(0);
              }}
              onDoubleClick={onDoubleClick}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <motion.div
                layoutId={`vf-photo-${current.id}`}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {current.kind === "image" ? (
                  <motion.img
                    src={current.url}
                    alt={current.row.file_name}
                    draggable={false}
                    style={{
                      maxWidth: "min(100%, 96vw)",
                      maxHeight: "78vh",
                      objectFit: "contain",
                      transform: `scale(${scale}) translate3d(${pan.x}px,${pan.y}px,0)`,
                      transition: scale === 1 ? "transform 220ms cubic-bezier(0.4,0,0.2,1)" : "none",
                      borderRadius: 8,
                      willChange: "transform",
                    }}
                  />
                ) : (
                  <video src={current.url} controls autoPlay style={{ maxWidth: "96vw", maxHeight: "78vh", borderRadius: 8 }} />
                )}
              </motion.div>
            </motion.div>

            {/* Thumbnail strip */}
            <div
              ref={stripRef}
              className="absolute left-0 right-0 z-20 flex items-center gap-2 overflow-x-auto"
              style={{
                bottom: 0, height: 78,
                padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
                background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))",
                scrollbarWidth: "none",
              }}
            >
              {media.map((m, i) => {
                const active = i === index;
                return (
                  <button
                    key={m.id}
                    data-idx={i}
                    onClick={() => { setIndex(i); setScale(1); setPan({ x: 0, y: 0 }); }}
                    aria-label={`View photo ${i + 1}`}
                    style={{
                      flex: "0 0 auto", width: 52, height: 52, borderRadius: 8, overflow: "hidden",
                      border: active ? "2px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                      background: "#111", padding: 0,
                    }}
                  >
                    <img src={m.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconGlass({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40, height: 40, borderRadius: 999,
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
