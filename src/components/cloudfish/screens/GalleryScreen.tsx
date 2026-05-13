import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Cloud, Download, FolderInput, Play, Share2, Trash2, X } from "lucide-react";

type SceneKind = "mountain" | "city" | "forest" | "sunset" | "ocean" | "desert";

const SCENES: { kind: SceneKind; from: string; to: string }[] = [
  { kind: "mountain", from: "#1a3a5c", to: "#2d6a9f" },
  { kind: "city",     from: "#2d1b4e", to: "#6b3fa0" },
  { kind: "forest",   from: "#1a4a2e", to: "#2d7a4f" },
  { kind: "sunset",   from: "#4a1a1a", to: "#9a3030" },
  { kind: "ocean",    from: "#1a2a4a", to: "#2a4a8a" },
  { kind: "desert",   from: "#3a2a1a", to: "#7a5a2a" },
];

type Item = {
  id: number;
  scene: SceneKind;
  from: string;
  to: string;
  video: boolean;
  dur: string;
  tall: boolean;
  account: string;
  date: string;
  size: string;
  name: string;
};

const ACCOUNTS = ["saran@gmail.com", "saran.college@gmail.com", "Dropbox", "OneDrive", "saran.work@gmail.com"];
const DATES = ["May 4, 2026", "Apr 27, 2026", "Apr 12, 2026", "Mar 30, 2026", "Mar 14, 2026", "Feb 22, 2026"];

const ITEMS: Item[] = Array.from({ length: 24 }).map((_, i) => {
  const s = SCENES[i % SCENES.length];
  const video = i % 4 === 1;
  return {
    id: i,
    scene: s.kind,
    from: s.from,
    to: s.to,
    video,
    dur: ["0:12", "0:38", "0:28", "1:05"][i % 4],
    tall: (i + 1) % 5 === 0,
    account: ACCOUNTS[i % ACCOUNTS.length],
    date: DATES[i % DATES.length],
    size: video ? `${(2 + ((i * 7) % 30) / 10).toFixed(1)} MB` : `${800 + ((i * 137) % 2400)} KB`,
    name: `${s.kind.charAt(0).toUpperCase() + s.kind.slice(1)}_${1000 + i}.${video ? "mp4" : "jpg"}`,
  };
});

function Scene({ kind }: { kind: SceneKind }) {
  // 100x100 viewBox; preserveAspectRatio slice fills cell
  switch (kind) {
    case "mountain":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="78" cy="22" r="8" fill="#fef3c7" opacity="0.85" />
          <polygon points="0,80 25,40 45,65 70,30 100,75 100,100 0,100" fill="#0f1f33" opacity="0.85" />
          <polygon points="20,55 30,45 38,55" fill="#ffffff" opacity="0.7" />
          <polygon points="65,40 70,32 78,42" fill="#ffffff" opacity="0.7" />
        </svg>
      );
    case "city":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="22" cy="28" r="6" fill="#f9a8d4" opacity="0.7" />
          <g fill="#0c0a1a" opacity="0.85">
            <rect x="5" y="55" width="12" height="45" />
            <rect x="20" y="40" width="14" height="60" />
            <rect x="36" y="50" width="10" height="50" />
            <rect x="48" y="30" width="16" height="70" />
            <rect x="66" y="48" width="12" height="52" />
            <rect x="80" y="38" width="16" height="62" />
          </g>
          <g fill="#fde68a" opacity="0.85">
            <rect x="23" y="46" width="2" height="2" /><rect x="28" y="52" width="2" height="2" />
            <rect x="51" y="38" width="2" height="2" /><rect x="57" y="46" width="2" height="2" />
            <rect x="83" y="46" width="2" height="2" /><rect x="89" y="54" width="2" height="2" />
          </g>
        </svg>
      );
    case "forest":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="20" cy="22" r="7" fill="#fef9c3" opacity="0.65" />
          <g fill="#0a2415" opacity="0.85">
            <polygon points="10,90 22,55 34,90" />
            <polygon points="28,95 44,45 60,95" />
            <polygon points="55,92 70,52 85,92" />
            <polygon points="75,95 88,60 100,95" />
          </g>
          <rect x="0" y="88" width="100" height="12" fill="#0a2415" opacity="0.95" />
        </svg>
      );
    case "sunset":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7a1d1d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100" height="60" fill="url(#sunsetSky)" />
          <circle cx="50" cy="58" r="14" fill="#fde047" opacity="0.85" />
          <rect x="0" y="62" width="100" height="38" fill="#1a0808" opacity="0.85" />
          <path d="M0 64 Q25 60 50 64 T100 64 L100 70 L0 70 Z" fill="#fbbf24" opacity="0.25" />
        </svg>
      );
    case "ocean":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100" height="50" fill="#1a2a4a" opacity="0.6" />
          <path d="M0 60 Q15 50 30 60 T60 60 T100 60 L100 100 L0 100 Z" fill="#0a1a3a" opacity="0.85" />
          <path d="M0 72 Q15 64 30 72 T60 72 T100 72 L100 100 L0 100 Z" fill="#1e3a6a" opacity="0.7" />
          <path d="M0 84 Q15 78 30 84 T60 84 T100 84 L100 100 L0 100 Z" fill="#3a5a9a" opacity="0.55" />
        </svg>
      );
    case "desert":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="80" cy="25" r="9" fill="#fef3c7" opacity="0.8" />
          <path d="M0 80 Q20 60 40 75 T80 70 T100 78 L100 100 L0 100 Z" fill="#3a2410" opacity="0.85" />
          <path d="M0 90 Q25 78 50 88 T100 88 L100 100 L0 100 Z" fill="#5a3818" opacity="0.9" />
        </svg>
      );
  }
}

function GrainOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.03,
        pointerEvents: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

function FilmFrame() {
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
      <rect x="2" y="2" width="60" height="44" rx="3" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {[6, 16, 26, 36, 46, 56].map((x) => (
        <rect key={`t${x}`} x={x} y="5" width="4" height="3" fill="rgba(255,255,255,0.2)" />
      ))}
      {[6, 16, 26, 36, 46, 56].map((x) => (
        <rect key={`b${x}`} x={x} y="40" width="4" height="3" fill="rgba(255,255,255,0.2)" />
      ))}
      <rect x="14" y="14" width="36" height="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
    </svg>
  );
}

function GlassDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(18,21,28,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "8px 14px",
          fontFamily: '"Inter", sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
        }}
      >
        {value}
        <ChevronDown size={14} strokeWidth={1.5} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: 160,
            background: "rgba(18,21,28,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: 6,
            zIndex: 30,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              className="file-menu-item"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                borderRadius: 6,
                fontFamily: '"Inter", sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: o === value ? "#4d90fe" : "rgba(255,255,255,0.75)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LazyCell({
  item,
  onOpen,
  selectionMode,
  selected,
  onToggle,
  onLongPress,
}: {
  item: Item;
  onOpen: () => void;
  selectionMode: boolean;
  selected: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(false);
  const lpTimer = useRef<number | null>(null);
  const lpTriggered = useRef(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  const startLP = () => {
    lpTriggered.current = false;
    if (lpTimer.current) window.clearTimeout(lpTimer.current);
    lpTimer.current = window.setTimeout(() => {
      lpTriggered.current = true;
      setPulse(true);
      window.setTimeout(() => setPulse(false), 200);
      onLongPress();
    }, 400);
  };
  const cancelLP = () => {
    if (lpTimer.current) {
      window.clearTimeout(lpTimer.current);
      lpTimer.current = null;
    }
  };

  const handleClick = () => {
    if (lpTriggered.current) {
      lpTriggered.current = false;
      return;
    }
    if (selectionMode) onToggle();
    else onOpen();
  };

  const showCheckbox = selectionMode || hover;

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={startLP}
      onTouchEnd={cancelLP}
      onTouchMove={cancelLP}
      onTouchCancel={cancelLP}
      style={{
        position: "relative",
        gridRow: item.tall ? "span 2" : undefined,
        width: "100%",
        height: item.tall ? 280 : 138,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
        contain: "layout style paint",
        border: selected ? "2px solid #4d90fe" : 0,
        padding: 0,
        cursor: "pointer",
        display: "block",
        transform: pulse ? "scale(0.95)" : selected ? "scale(0.95)" : "scale(1)",
        transition: "transform 200ms ease, border-color 150ms ease",
      }}
    >
      {visible && (
        <>
          <Scene kind={item.scene} />
          <GrainOverlay />
        </>
      )}

      {/* Hover bottom gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))",
          opacity: hover ? 1 : 0,
          transition: "opacity 200ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Cloud icon bottom-left */}
      <div style={{ position: "absolute", left: 8, bottom: 8, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>
        <Cloud size={16} strokeWidth={1.5} color="#ffffff" />
      </div>

      {/* Video duration / play */}
      {item.video && (
        <>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ height: 36, width: 36, borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={16} strokeWidth={1.5} color="#fff" />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 8,
              bottom: 8,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              borderRadius: 4,
              padding: "2px 6px",
              fontFamily: '"Inter Tight", "Inter", sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            {item.dur}
          </div>
        </>
      )}

      {/* Selection checkbox top-left */}
      <span
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          height: 22,
          width: 22,
          borderRadius: 999,
          border: selected ? "none" : "2px solid rgba(255,255,255,0.6)",
          background: selected ? "#4d90fe" : "transparent",
          opacity: showCheckbox ? 1 : 0,
          transition: "opacity 200ms ease, background 200ms ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: selected ? "0 0 0 2px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        {selected && <CheckMark />}
      </span>
    </button>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: Item[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (dx > 60) onPrev();
        else if (dx < -60) onNext();
        touchStart.current = null;
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "previewFade 200ms ease",
      }}
    >
      {/* Photo */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "85vw",
          maxHeight: "85vh",
          width: "min(85vw, 900px)",
          height: "min(85vh, 600px)",
          background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
          overflow: "hidden",
          animation: "previewIn 200ms ease",
        }}
      >
        <Scene kind={item.scene} />
        <GrainOverlay />
        {item.video && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ height: 64, width: 64, borderRadius: 999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={28} strokeWidth={1.5} color="#fff" />
            </div>
          </div>
        )}
      </div>

      {/* Top right controls */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 8 }}>
        {[Download, Share2, X].map((I, i) => (
          <button
            key={i}
            onClick={i === 2 ? onClose : undefined}
            style={{
              height: 40, width: 40, borderRadius: 999,
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: 0, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <I size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        style={{
          position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
          height: 48, width: 48, borderRadius: 999,
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          border: 0, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        style={{
          position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
          height: 48, width: 48, borderRadius: 999,
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          border: 0, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      {/* Bottom info bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", left: 16, right: 16, bottom: 16,
          background: "rgba(8,9,14,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
          padding: "10px 14px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          fontFamily: '"Inter", sans-serif', color: "rgba(255,255,255,0.85)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
          background: "rgba(77,144,254,0.15)", color: "#8ab4ff",
        }}>{item.account}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.date}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.size}</span>
      </div>
    </div>
  );
}

export function GalleryScreen() {
  const [tab, setTab] = useState<"all" | "photos" | "videos">("all");
  const [time, setTime] = useState<"Years" | "Months" | "Days">("Days");
  const [cloud, setCloud] = useState("All Clouds");
  const [sort, setSort] = useState("Recent");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const visible = useMemo(
    () => ITEMS.filter((x) => tab === "all" || (tab === "videos" ? x.video : !x.video)),
    [tab],
  );

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const exitSelection = () => { setSelectionMode(false); setSelected(new Set()); };
  const selectAll = () => setSelected(new Set(visible.map((v) => v.id)));

  const tabs: ("all" | "photos" | "videos")[] = ["all", "photos", "videos"];
  const timeTabs: ("Years" | "Months" | "Days")[] = ["Years", "Months", "Days"];
  const timeIdx = timeTabs.indexOf(time);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.95)" }}>
          Gallery
        </h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          2,847 items across 5 accounts
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 18px",
                borderRadius: 999,
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                fontWeight: 600,
                border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                background: active ? "#4d90fe" : "rgba(255,255,255,0.05)",
                color: active ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 200ms ease",
                cursor: "pointer",
              }}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Dropdowns */}
      <div style={{ display: "flex", gap: 8 }}>
        <GlassDropdown value={cloud} options={["All Clouds", "Google Drive", "Dropbox", "OneDrive"]} onChange={setCloud} />
        <GlassDropdown value={sort} options={["Recent", "Oldest", "Largest"]} onChange={setSort} />
      </div>

      {/* Grid or empty state */}
      {visible.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
          <FilmFrame />
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>No videos yet</div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Videos from your connected clouds will appear here
          </div>
        </div>
      ) : (
        <div
          key={tab}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 3,
            gridAutoRows: 138,
            animation: "listFade 200ms ease",
          }}
        >
          {visible.map((it, i) => (
            <LazyCell key={it.id} item={it} onOpen={() => setOpenIdx(i)} />
          ))}
        </div>
      )}

      {/* Timeline scrubber */}
      <div
        style={{
          position: "sticky",
          bottom: 72,
          marginTop: 24,
          background: "rgba(8,9,14,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "10px 12px 12px",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {timeTabs.map((t) => {
            const active = time === t;
            return (
              <button
                key={t}
                onClick={() => setTime(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  background: active ? "rgba(77,144,254,0.15)" : "transparent",
                  color: active ? "#4d90fe" : "rgba(255,255,255,0.55)",
                  border: 0,
                  cursor: "pointer",
                  transition: "all 200ms ease",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative", height: 2, marginTop: 8, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 180, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 999 }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${(timeIdx / (timeTabs.length - 1)) * (180 - 40)}px`,
                width: 40,
                height: 2,
                background: "#4d90fe",
                borderRadius: 999,
                transition: "left 200ms ease",
              }}
            />
          </div>
        </div>
      </div>

      {openIdx != null && (
        <Lightbox
          items={visible}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onPrev={() => setOpenIdx((i) => (i == null ? null : (i - 1 + visible.length) % visible.length))}
          onNext={() => setOpenIdx((i) => (i == null ? null : (i + 1) % visible.length))}
        />
      )}
    </div>
  );
}
