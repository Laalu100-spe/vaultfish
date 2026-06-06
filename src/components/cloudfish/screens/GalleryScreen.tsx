import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Share2, Cloud } from "lucide-react";

type Photo = {
  id: number;
  gradient: string;
  timeAgo: string;
  source: string;
  filename: string;
  emoji: string;
};

const GRADIENTS = [
  "linear-gradient(145deg, #2a1500, #5c3300)",
  "linear-gradient(145deg, #00081f, #00103d)",
  "linear-gradient(145deg, #031403, #073507)",
  "linear-gradient(145deg, #180310, #3a0724)",
  "linear-gradient(145deg, #180d00, #3d2200)",
  "linear-gradient(145deg, #001818, #003030)",
];

const EMOJIS = ["🌅", "🏖️", "🌊", "🌸", "🍂", "⛰️", "🌃", "✨", "🌙", "🔥", "🌿", "🎞️"];
const SOURCES = ["Google Drive", "Dropbox", "OneDrive", "iCloud"];
const TIMES = ["2m ago", "1h ago", "3h ago", "Yesterday", "2d ago", "1w ago", "Mar 14", "Feb 02"];
const NAMES = [
  "Sunset.jpg", "Beach Day.jpg", "Ocean View.png", "Cherry Blossom.jpg",
  "Autumn Walk.jpg", "Summit.jpg", "City Lights.png", "Sparkle.jpg",
  "Moonrise.jpg", "Bonfire.jpg", "Garden.jpg", "Film Roll.jpg",
];

const PHOTOS: Photo[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  gradient: GRADIENTS[i % GRADIENTS.length],
  timeAgo: TIMES[i % TIMES.length],
  source: SOURCES[i % SOURCES.length],
  filename: NAMES[i % NAMES.length],
  emoji: EMOJIS[i % EMOJIS.length],
}));

export function GalleryScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<"none" | "left" | "right">("none");
  const [animating, setAnimating] = useState(false);

  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const mouse = useRef<{ x: number; y: number } | null>(null);

  const total = PHOTOS.length;
  const current = selected !== null ? PHOTOS[selected] : null;
  const prev = selected !== null && selected > 0 ? PHOTOS[selected - 1] : null;
  const next = selected !== null && selected < total - 1 ? PHOTOS[selected + 1] : null;

  const close = () => {
    setPanelOpen(false);
    setSelected(null);
  };

  const go = (dir: 1 | -1) => {
    if (selected === null || animating) return;
    const target = selected + dir;
    if (target < 0 || target >= total) return;
    setSlideDir(dir === 1 ? "left" : "right");
    setAnimating(true);
    window.setTimeout(() => {
      setSelected(target);
      setSlideDir("none");
      setAnimating(false);
    }, 280);
  };

  // Keyboard
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Escape") close();
      else if (e.key === " ") {
        e.preventDefault();
        setPanelOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, animating]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.touches[0];
    const dy = t.clientY - touch.current.y;
    const dx = t.clientX - touch.current.x;
    if (!panelOpen && dy > 60 && Math.abs(dy) > Math.abs(dx)) {
      touch.current = null;
      close();
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) go(1);
      else go(-1);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!mouse.current) return;
    const dx = e.clientX - mouse.current.x;
    const dy = e.clientY - mouse.current.y;
    mouse.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) go(1);
      else go(-1);
    }
  };

  const cells = useMemo(() => PHOTOS, []);

  return (
    <div style={{ padding: "16px 12px 80px", maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "8px 4px 16px", letterSpacing: "-0.02em" }}>
        Gallery
      </h1>

      <div className="vf-gallery-grid">
        {cells.map((p, i) => {
          const isWide = (i + 1) % 5 === 0;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(i)}
              className="vf-gallery-cell"
              style={{
                background: p.gradient,
                gridColumn: isWide ? "span 2" : undefined,
                aspectRatio: isWide ? "2 / 1" : "1 / 1",
              }}
              aria-label={p.filename}
            >
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isWide ? 32 : 22, opacity: 0.85 }}>
                {p.emoji}
              </div>
              <div className="vf-gallery-cell-overlay" />
              <span style={{ position: "absolute", left: 6, bottom: 5, fontFamily: "Inter", fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {p.timeAgo}
              </span>
              <Cloud size={10} style={{ position: "absolute", right: 6, bottom: 5, opacity: 0.4, color: "#fff" }} />
            </button>
          );
        })}
      </div>

      {selected !== null && current && (
        <div
          className="vf-gal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Side peeks */}
          {prev && (
            <div className="vf-gal-peek vf-gal-peek-left" style={{ background: prev.gradient }} />
          )}
          {next && (
            <div className="vf-gal-peek vf-gal-peek-right" style={{ background: next.gradient }} />
          )}

          {/* Top bar */}
          <div className="vf-gal-topbar">
            <button onClick={close} className="vf-gal-iconbtn" aria-label="Back">
              <ChevronLeft size={24} color="#fff" />
            </button>
            <span style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.8)" }}>
              {selected + 1} of {total}
            </span>
            <button className="vf-gal-iconbtn" aria-label="Share">
              <Share2 size={20} color="#fff" />
            </button>
          </div>

          {/* Photo stage */}
          <div
            className="vf-gal-stage"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            style={{
              transform: panelOpen ? "translateY(-20px) scale(0.82)" : "translateY(0) scale(1)",
              transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div
              className="vf-gal-photo"
              style={{
                background: current.gradient,
                transform:
                  slideDir === "left"
                    ? "translateX(-100%)"
                    : slideDir === "right"
                    ? "translateX(100%)"
                    : "translateX(0)",
                opacity: slideDir === "none" ? 1 : 0,
                transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 280ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div style={{ fontSize: 64, lineHeight: 1 }}>{current.emoji}</div>
              <div style={{ marginTop: 18, fontFamily: "Inter", fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                {current.filename}
              </div>
              <div style={{ marginTop: 8, fontFamily: "Inter", fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999 }}>
                {current.source}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="vf-gal-dots">
            {PHOTOS.slice(Math.max(0, selected - 4), Math.min(total, selected + 5)).map((p, idx) => {
              const realIdx = Math.max(0, selected - 4) + idx;
              const active = realIdx === selected;
              return (
                <span
                  key={p.id}
                  style={{
                    width: active ? 7 : 4,
                    height: active ? 7 : 4,
                    borderRadius: 999,
                    background: active ? "#ffffff" : "rgba(255,255,255,0.3)",
                    transition: "all 200ms ease",
                  }}
                />
              );
            })}
          </div>

          {/* Handle */}
          <button
            onClick={() => setPanelOpen((p) => !p)}
            className="vf-gal-handle"
            aria-label="Toggle memory panel"
          />

          {/* Memory panel */}
          <div
            className="vf-gal-panel"
            style={{
              transform: panelOpen ? "translateY(0)" : "translateY(100%)",
              transition: panelOpen
                ? "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)"
                : "transform 280ms ease",
            }}
          >
            <div className="vf-gal-panel-handle" />
            <div style={{ fontSize: 48, lineHeight: 1, marginTop: 4 }}>{current.emoji}</div>
            <div style={{ marginTop: 10, fontFamily: "Inter", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
              {current.filename}
            </div>
            <div style={{ marginTop: 4, fontFamily: "Inter", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {current.timeAgo} · {current.source}
            </div>
            <div style={{ marginTop: 16, width: "100%", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              You haven't opened this in 47 days.
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
              {["4.2 MB", "1080×1920", "JPEG"].map((s) => (
                <span key={s} style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.05)", fontFamily: "Inter", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{s}</span>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10, width: "100%" }}>
              <button style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(255,255,255,0.06)", color: "#fff", fontFamily: "Inter", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>Keep</button>
              <button style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#4d90fe", color: "#fff", fontFamily: "Inter", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Archive</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vf-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
        }
        @media (min-width: 900px) {
          .vf-gallery-grid { grid-template-columns: repeat(5, 1fr); }
        }
        .vf-gallery-cell {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: none;
          padding: 0;
          transition: transform 150ms ease;
        }
        @media (hover: hover) {
          .vf-gallery-cell:hover { transform: scale(1.02); }
        }
        .vf-gallery-cell-overlay {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 40%;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.6));
          pointer-events: none;
        }
        .vf-gal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: #000;
          animation: vfGalFade 250ms ease forwards;
          overflow: hidden;
        }
        @keyframes vfGalFade { from { opacity: 0; } to { opacity: 1; } }
        .vf-gal-peek {
          position: absolute; top: 0; bottom: 0;
          width: 10%;
          filter: blur(8px);
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
        }
        .vf-gal-peek-left { left: 0; }
        .vf-gal-peek-right { right: 0; }
        .vf-gal-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
          height: 80px;
          z-index: 10;
        }
        .vf-gal-iconbtn {
          background: transparent; border: none; cursor: pointer;
          padding: 6px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
        }
        .vf-gal-iconbtn:hover { background: rgba(255,255,255,0.08); }
        .vf-gal-stage {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
        }
        .vf-gal-photo {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          will-change: transform, opacity;
        }
        @media (min-width: 900px) {
          .vf-gal-photo {
            inset: 0;
            margin: auto;
            max-width: 75vw;
            max-height: 80vh;
            border-radius: 12px;
          }
        }
        .vf-gal-dots {
          position: absolute; left: 50%; bottom: 56px;
          transform: translateX(-50%);
          display: flex; align-items: center; gap: 6px;
          z-index: 10;
        }
        .vf-gal-handle {
          position: absolute; left: 50%; bottom: 20px;
          transform: translateX(-50%);
          width: 32px; height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.3);
          border: none; cursor: pointer; padding: 0;
          z-index: 11;
        }
        .vf-gal-panel {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 60vh;
          background: rgba(8,6,4,0.97);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 24px 24px 0 0;
          z-index: 20;
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 24px 32px;
          will-change: transform;
        }
        .vf-gal-panel-handle {
          width: 36px; height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.2);
          margin-bottom: 18px;
        }
      `}</style>
    </div>
  );
}
