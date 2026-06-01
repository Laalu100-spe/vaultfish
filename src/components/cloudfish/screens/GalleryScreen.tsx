import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Cloud, FolderInput, Lightbulb, Play, Share2, Trash2 } from "lucide-react";
import { analyzePhoto } from "@/lib/photo-ai.functions";

// ---------- Real Unsplash photos ----------
type Photo = {
  id: number;
  url: string;
  thumb: string;
  video: boolean;
  dur: string;
  tall: boolean;
  account: string;
  date: string;
  size: string;
  name: string;
};

const RAW = [
  { u: "photo-1506905925346-21bda4d32df4", n: "Mountain_Sunrise.jpg" },
  { u: "photo-1519681393784-d120267933ba", n: "Alpine_Lake.jpg" },
  { u: "photo-1500382017468-9049fed747ef", n: "Field_Light.jpg" },
  { u: "photo-1469474968028-56623f02e42e", n: "Open_Road.jpg" },
  { u: "photo-1470071459604-3b5ec3a7fe05", n: "Forest_Mist.jpg" },
  { u: "photo-1493246507139-91e8fad9978e", n: "Reflection.jpg" },
  { u: "photo-1418065460487-3e41a6c84dc5", n: "Sunset_Valley.jpg" },
  { u: "photo-1501785888041-af3ef285b470", n: "River_Bend.jpg" },
  { u: "photo-1502082553048-f009c37129b9", n: "Autumn_Trees.jpg" },
  { u: "photo-1447752875215-b2761acb3c5d", n: "Forest_Floor.jpg" },
  { u: "photo-1426604966848-d7adac402bff", n: "Cliffs.jpg" },
  { u: "photo-1485470733090-0aae1788d5af", n: "Bridge.jpg" },
  { u: "photo-1441974231531-c6227db76b6e", n: "Pine_Lake.jpg" },
  { u: "photo-1472214103451-9374bd1c798e", n: "Snow_Peak.jpg" },
  { u: "photo-1433086966358-54859d0ed716", n: "Waterfall.jpg" },
  { u: "photo-1439066615861-d1af74d74000", n: "Stars_Night.jpg" },
  { u: "photo-1454496522488-7a8e488e8606", n: "Desert_Dunes.jpg" },
  { u: "photo-1505765050516-f72dcac9c60e", n: "City_Skyline.jpg" },
  { u: "photo-1486312338219-ce68d2c6f44d", n: "Office_Window.jpg" },
  { u: "photo-1483347756197-71ef80e95f73", n: "Beach_Walk.jpg" },
  { u: "photo-1444723121867-7a241cacace9", n: "Coffee_Morning.jpg" },
  { u: "photo-1416879595882-3373a0480b5b", n: "Aerial_Coast.jpg" },
  { u: "photo-1500534314209-a25ddb2bd429", n: "Rolling_Hills.jpg" },
  { u: "photo-1518837695005-2083093ee35b", n: "Ocean_Wave.jpg" },
];
const ACCOUNTS = ["saran@gmail.com", "saran.college@gmail.com", "Dropbox", "OneDrive", "saran.work@gmail.com"];
const DATES = ["May 4, 2026", "Apr 27, 2026", "Apr 12, 2026", "Mar 30, 2026", "Mar 14, 2026", "Feb 22, 2026"];

const ITEMS: Photo[] = RAW.map((r, i) => {
  const video = i % 7 === 3;
  return {
    id: i,
    url: `https://images.unsplash.com/${r.u}?w=1400&q=80&auto=format&fit=crop`,
    thumb: `https://images.unsplash.com/${r.u}?w=400&h=400&q=70&auto=format&fit=crop`,
    video,
    dur: ["0:12", "0:38", "0:28", "1:05"][i % 4],
    tall: (i + 1) % 5 === 0,
    account: ACCOUNTS[i % ACCOUNTS.length],
    date: DATES[i % DATES.length],
    size: video ? `${(2 + ((i * 7) % 30) / 10).toFixed(1)} MB` : `${800 + ((i * 137) % 2400)} KB`,
    name: r.n,
  };
});

// ---------- Color extraction ----------
function useDominantColors(items: Photo[]) {
  const [colors, setColors] = useState<Record<number, string>>({});
  useEffect(() => {
    let cancelled = false;
    items.forEach((it) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = it.thumb;
      img.onload = () => {
        if (cancelled) return;
        try {
          const c = document.createElement("canvas");
          c.width = 24; c.height = 24;
          const ctx = c.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, 24, 24);
          const d = ctx.getImageData(0, 0, 24, 24).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) {
            r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
          }
          const hex = `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
          setColors((p) => ({ ...p, [it.id]: hex }));
        } catch { /* CORS may block; ignore */ }
      };
    });
    return () => { cancelled = true; };
  }, [items]);
  return colors;
}

// ---------- Grid cell ----------
function Cell({
  item, idx, color, onOpen, breathing,
}: {
  item: Photo; idx: number; color?: string; onOpen: (rect: DOMRect) => void; breathing: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      data-photo-id={item.id}
      onClick={() => { if (ref.current) onOpen(ref.current.getBoundingClientRect()); }}
      className={breathing ? "vf-breath" : ""}
      style={{
        position: "relative",
        gridRow: item.tall ? "span 2" : undefined,
        height: item.tall ? 280 : 138,
        overflow: "hidden",
        background: "#0e1118",
        contain: "layout style paint",
        border: 0,
        padding: 0,
        cursor: "pointer",
        display: "block",
        borderBottom: color ? `2px solid ${color}` : "2px solid transparent",
        willChange: "transform",
        animationDelay: `${(idx % 9) * 200}ms`,
      }}
    >
      <img
        src={item.thumb}
        alt={item.name}
        loading="lazy"
        decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.35))",
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", left: 8, bottom: 8, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>
        <Cloud size={16} strokeWidth={1.5} color="#ffffff" />
      </div>
      {item.video && (
        <>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ height: 36, width: 36, borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={16} strokeWidth={1.5} color="#fff" />
            </div>
          </div>
          <div style={{
            position: "absolute", right: 8, bottom: 8,
            background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px",
            fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 11, fontWeight: 700,
            color: "#fff", letterSpacing: "-0.01em",
          }}>
            {item.dur}
          </div>
        </>
      )}
    </button>
  );
}

// ---------- Glass dropdown (kept, simplified) ----------
function GlassDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(18,21,28,0.9)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "8px 14px",
        fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500,
        color: "rgba(255,255,255,0.7)", cursor: "pointer",
      }}>
        {value}<ChevronDown size={14} strokeWidth={1.5} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 160,
          background: "rgba(18,21,28,0.95)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 6, zIndex: 30, boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        }}>
          {options.map((o) => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              display: "block", width: "100%", textAlign: "left", padding: "8px 10px",
              borderRadius: 6, fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500,
              color: o === value ? "#4d90fe" : "rgba(255,255,255,0.75)",
              background: "transparent", cursor: "pointer", border: 0,
            }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Liquid Viewer ----------
type AIResp = { summary: string; account_detail: string; smart_action: string; insight: string; emoji: string };

function LiquidViewer({
  items, index, originRect, dominant, onClose, onIndexChange,
}: {
  items: Photo[]; index: number; originRect: DOMRect | null;
  dominant: Record<number, string>;
  onClose: (toRect?: DOMRect | null) => void;
  onIndexChange: (i: number) => void;
}) {
  const item = items[index];
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [aiCache, setAiCache] = useState<Record<number, AIResp>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeY, setSwipeY] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStart = useRef<{ x: number; y: number; mode: "h" | "v" | "?" } | null>(null);
  const analyze = useServerFn(analyzePhoto);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, panelOpen]);

  const loadAI = useCallback(async (it: Photo) => {
    if (aiCache[it.id]) return;
    setAiLoading(true);
    try {
      const res = await analyze({
        data: { name: it.name, type: it.video ? "video/mp4" : "image/jpeg", account: it.account, date: it.date, size: it.size },
      });
      setAiCache((p) => ({ ...p, [it.id]: res as AIResp }));
    } catch {
      setAiCache((p) => ({ ...p, [it.id]: {
        summary: `Looks like a ${it.video ? "short video" : "photo"} from your library.`,
        account_detail: `${it.account} · ${it.date}`,
        smart_action: "Consider organizing this into a memory album.",
        insight: "Part of your visual story.",
        emoji: it.video ? "🎬" : "🖼️",
      } }));
    } finally {
      setAiLoading(false);
    }
  }, [aiCache, analyze]);

  useEffect(() => { if (panelOpen) loadAI(item); }, [panelOpen, item, loadAI]);

  const doClose = () => {
    if (panelOpen) { setPanelOpen(false); return; }
    setClosing(true);
    setTimeout(() => {
      const target = document.querySelector(`[data-photo-id="${item.id}"]`) as HTMLElement | null;
      onClose(target?.getBoundingClientRect() ?? null);
    }, 320);
  };

  const goNext = () => {
    const next = (index + 1) % items.length;
    onIndexChange(next);
  };
  const goPrev = () => {
    const next = (index - 1 + items.length) % items.length;
    onIndexChange(next);
  };

  // Compute morph transform
  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const targetW = Math.min(vw, 900);
  const targetH = Math.min(vh * (panelOpen ? 0.85 : 1), 900);

  const start = originRect ?? { left: vw / 2, top: vh / 2, width: 0, height: 0 } as DOMRect;
  const initialTransform = `translate(${start.left - (vw - targetW) / 2}px, ${start.top - (vh - targetH) / 2}px) scale(${start.width / targetW}, ${start.height / targetH})`;

  const photoTransform = (!mounted || closing)
    ? initialTransform
    : panelOpen
      ? `translate(0px, -20px) scale(0.85)`
      : swiping
        ? `translate(${swipeX}px, ${swipeY}px) scale(${1 - Math.abs(swipeX) / 1200 - Math.max(0, swipeY) / 800})`
        : `translate(0px, 0px) scale(1)`;

  const photoOpacity = (!mounted || closing) ? 0.1 : (swiping ? 1 - Math.abs(swipeX) / 800 : 1);
  const dom = dominant[item.id] ?? "#0a0c12";

  const onTStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, mode: "?" };
    setSwiping(true);
  };
  const onTMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (touchStart.current.mode === "?") {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        touchStart.current.mode = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
    }
    if (touchStart.current.mode === "h") setSwipeX(dx);
    else if (touchStart.current.mode === "v" && dy > 0) setSwipeY(dy);
  };
  const onTEnd = () => {
    if (!touchStart.current) return;
    const mode = touchStart.current.mode;
    touchStart.current = null;
    setSwiping(false);
    if (mode === "h") {
      if (swipeX < -60) { setSwipeX(0); goNext(); return; }
      if (swipeX > 60) { setSwipeX(0); goPrev(); return; }
    }
    if (mode === "v" && swipeY > 100) {
      setSwipeY(0);
      doClose();
      return;
    }
    setSwipeX(0); setSwipeY(0);
  };

  if (typeof document === "undefined") return null;
  const ai = aiCache[item.id];

  const content = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: `radial-gradient(circle at center, ${dom}cc 0%, #050709 70%)`,
        transition: "background 380ms ease",
        overflow: "hidden",
      }}
    >
      {/* Backdrop blur layer of dominant */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: dom, opacity: mounted && !closing ? 0.35 : 0,
        filter: "blur(60px)",
        transition: "opacity 380ms ease",
      }} />

      {/* Close zone (tap outside) */}
      <div onClick={doClose} style={{ position: "absolute", inset: 0 }} />

      {/* Photo morph */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTStart}
        onTouchMove={onTMove}
        onTouchEnd={onTEnd}
        style={{
          position: "absolute",
          left: (vw - targetW) / 2,
          top: (vh - targetH) / 2,
          width: targetW,
          height: targetH,
          transform: photoTransform,
          transformOrigin: "top left",
          transition: swiping ? "none" : "transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 320ms ease",
          opacity: photoOpacity,
          willChange: "transform, opacity",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
        }}
      >
        <img
          src={item.url}
          alt={item.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "filter 220ms ease",
            filter: swiping && Math.abs(swipeX) > 40 ? `blur(${Math.min(4, Math.abs(swipeX) / 40)}px)` : "none",
          }}
        />
        {item.video && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ height: 64, width: 64, borderRadius: 999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={28} strokeWidth={1.5} color="#fff" />
            </div>
          </div>
        )}
      </div>

      {/* Pull handle / panel */}
      <div
        onClick={(e) => { e.stopPropagation(); setPanelOpen((o) => !o); }}
        style={{
          position: "absolute",
          left: 0, right: 0,
          bottom: panelOpen ? 0 : 20,
          transition: "bottom 420ms cubic-bezier(0.32, 0.72, 0, 1), height 420ms cubic-bezier(0.32, 0.72, 0, 1)",
          height: panelOpen ? "65vh" : 36,
          background: panelOpen ? "rgba(10,12,18,0.95)" : "transparent",
          backdropFilter: panelOpen ? "blur(24px)" : "none",
          WebkitBackdropFilter: panelOpen ? "blur(24px)" : "none",
          borderRadius: "28px 28px 0 0",
          border: panelOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          cursor: "pointer",
          overflow: "hidden",
          willChange: "transform, height",
        }}
      >
        {/* Pull handle bar */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{
            width: 44, height: 5, borderRadius: 999,
            background: "rgba(255,255,255,0.35)",
          }} />
        </div>

        {panelOpen && (
          <div onClick={(e) => e.stopPropagation()} style={{
            padding: "28px 24px 24px",
            fontFamily: '"Inter", sans-serif',
            color: "#fff",
            display: "flex", flexDirection: "column", gap: 16,
            height: "calc(65vh - 25px)",
            overflowY: "auto",
          }}>
            {aiLoading || !ai ? (
              <SkeletonPanel />
            ) : (
              <>
                <div style={{ fontSize: 48, textAlign: "center", lineHeight: 1 }}>{ai.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{ai.summary}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {[item.account, item.size, item.date].map((t, i) => (
                    <span key={i} style={{
                      background: "rgba(255,255,255,0.08)", borderRadius: 999,
                      padding: "5px 12px", fontSize: 11, fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{
                  background: "rgba(77,144,254,0.1)",
                  border: "1px solid rgba(77,144,254,0.25)",
                  borderRadius: 14, padding: 14,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <Lightbulb size={18} strokeWidth={1.6} color="#4d90fe" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.45 }}>{ai.smart_action}</div>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>
                  {ai.insight}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                  <ActionPill icon={FolderInput} label="Move" primary />
                  <ActionPill icon={Share2} label="Share" />
                  <ActionPill icon={Trash2} label="Delete" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top bar with name and counter */}
      {!panelOpen && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: "absolute", top: 20, left: 16, right: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: '"Inter", sans-serif', color: "#fff",
          opacity: mounted && !closing ? 1 : 0, transition: "opacity 280ms ease",
        }}>
          <button onClick={doClose} style={{
            height: 36, width: 36, borderRadius: 999, border: 0,
            background: "rgba(255,255,255,0.12)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            fontSize: 20, lineHeight: 1,
          }}>×</button>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums" }}>
            {index + 1} / {items.length}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

function SkeletonPanel() {
  const bar = (w: string, h = 16) => (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 100%)",
      backgroundSize: "200% 100%",
      animation: "vfShimmer 1.6s ease-in-out infinite",
    }} />
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
        backgroundSize: "200% 100%", animation: "vfShimmer 1.6s ease-in-out infinite",
      }} />
      {bar("70%", 22)}
      <div style={{ display: "flex", gap: 6 }}>{bar("80px", 22)}{bar("60px", 22)}{bar("80px", 22)}</div>
      {bar("100%", 60)}
      {bar("85%")}
    </div>
  );
}

function ActionPill({ icon: Icon, label, primary }: { icon: typeof FolderInput; label: string; primary?: boolean }) {
  return (
    <button style={{
      flex: 1, height: 44, borderRadius: 999, border: 0,
      background: primary ? "#4d90fe" : "rgba(255,255,255,0.08)",
      color: "#fff", fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      cursor: "pointer", transition: "transform 150ms ease",
    }}>
      <Icon size={15} strokeWidth={1.8} /> {label}
    </button>
  );
}

// ---------- Main screen ----------
export function GalleryScreen() {
  const [tab, setTab] = useState<"all" | "photos" | "videos">("all");
  const [cloud, setCloud] = useState("All Clouds");
  const [sort, setSort] = useState("Recent");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [breathing, setBreathing] = useState(false);
  const idleTimer = useRef<number | null>(null);

  const visible = useMemo(
    () => ITEMS.filter((x) => tab === "all" || (tab === "videos" ? x.video : !x.video)),
    [tab],
  );
  const dominant = useDominantColors(visible);

  // Breathing idle: 3s after last interaction
  useEffect(() => {
    const reset = () => {
      setBreathing(false);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setBreathing(true), 3000);
    };
    reset();
    window.addEventListener("touchstart", reset, { passive: true });
    window.addEventListener("mousemove", reset);
    window.addEventListener("scroll", reset, { passive: true });
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      window.removeEventListener("touchstart", reset);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("scroll", reset);
    };
  }, []);

  const handleOpen = (i: number, rect: DOMRect) => {
    setOriginRect(rect);
    setOpenIdx(i);
  };

  const tabs: ("all" | "photos" | "videos")[] = ["all", "photos", "videos"];

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.95)" }}>
          Gallery
        </h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          {ITEMS.length} items · Liquid Photos
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 18px", borderRadius: 999,
              fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
              border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "#4d90fe" : "rgba(255,255,255,0.05)",
              color: active ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 200ms ease", cursor: "pointer",
            }}>{t[0].toUpperCase() + t.slice(1)}</button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <GlassDropdown value={cloud} options={["All Clouds", "Google Drive", "Dropbox", "OneDrive"]} onChange={setCloud} />
        <GlassDropdown value={sort} options={["Recent", "Oldest", "Largest"]} onChange={setSort} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 3,
        gridAutoRows: 138,
      }}>
        {visible.map((it, i) => (
          <Cell
            key={it.id}
            item={it}
            idx={i}
            color={dominant[it.id]}
            breathing={breathing && openIdx == null}
            onOpen={(rect) => handleOpen(i, rect)}
          />
        ))}
      </div>

      {openIdx != null && (
        <LiquidViewer
          items={visible}
          index={openIdx}
          originRect={originRect}
          dominant={dominant}
          onClose={() => setOpenIdx(null)}
          onIndexChange={(i) => {
            const target = document.querySelector(`[data-photo-id="${visible[i].id}"]`) as HTMLElement | null;
            if (target) setOriginRect(target.getBoundingClientRect());
            setOpenIdx(i);
          }}
        />
      )}
    </div>
  );
}
