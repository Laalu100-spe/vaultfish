import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, ArrowLeft } from "lucide-react";
import { useWindowSize, useIsTouch } from "@/hooks/useWindowSize";

type Mood = { name: string; gradient: string; deep: string };

const MOODS: Mood[] = [
  { name: "amber",  gradient: "linear-gradient(135deg,#2a1a00,#5a3800)", deep: "#1a0f00" },
  { name: "night",  gradient: "linear-gradient(135deg,#000820,#001040)", deep: "#000516" },
  { name: "forest", gradient: "linear-gradient(135deg,#041a04,#083d08)", deep: "#021002" },
  { name: "rose",   gradient: "linear-gradient(135deg,#1a0410,#3d0828)", deep: "#10030a" },
  { name: "desert", gradient: "linear-gradient(135deg,#1a0e00,#3d2400)", deep: "#100800" },
  { name: "teal",   gradient: "linear-gradient(135deg,#001a1a,#003030)", deep: "#001010" },
];

type Photo = {
  id: number;
  url: string;
  thumb: string;
  account: "Google Drive" | "Dropbox" | "OneDrive";
  ago: string;
  daysAgo: number;
  size: string;
  name: string;
  emoji: string;
  mood: Mood;
};

const RAW = [
  "photo-1506905925346-21bda4d32df4", "photo-1519681393784-d120267933ba",
  "photo-1500382017468-9049fed747ef", "photo-1469474968028-56623f02e42e",
  "photo-1470071459604-3b5ec3a7fe05", "photo-1493246507139-91e8fad9978e",
  "photo-1418065460487-3e41a6c84dc5", "photo-1501785888041-af3ef285b470",
  "photo-1502082553048-f009c37129b9", "photo-1447752875215-b2761acb3c5d",
  "photo-1426604966848-d7adac402bff", "photo-1485470733090-0aae1788d5af",
  "photo-1441974231531-c6227db76b6e", "photo-1472214103451-9374bd1c798e",
  "photo-1433086966358-54859d0ed716", "photo-1439066615861-d1af74d74000",
  "photo-1454496522488-7a8e488e8606", "photo-1505765050516-f72dcac9c60e",
  "photo-1486312338219-ce68d2c6f44d", "photo-1483347756197-71ef80e95f73",
  "photo-1444723121867-7a241cacace9", "photo-1416879595882-3373a0480b5b",
  "photo-1500534314209-a25ddb2bd429", "photo-1518837695005-2083093ee35b",
];
const AGOS = [
  { ago: "yesterday", d: 1 }, { ago: "last week", d: 7 },
  { ago: "2 weeks ago", d: 14 }, { ago: "1 month ago", d: 30 },
  { ago: "3 months ago", d: 90 }, { ago: "6 months ago", d: 180 },
];
const ACCOUNTS: Photo["account"][] = ["Google Drive", "Dropbox", "OneDrive"];
const EMOJIS = ["🏔️","🌊","🌅","🛣️","🌲","💭","🌄","🏞️","🍂","🌳","⛰️","🌉","🏕️","❄️","💧","✨","🏜️","🌃","🪟","🏖️","☕","🛩️","🌾","🌊"];
const NAMES = ["Mountain_Sunrise","Alpine_Lake","Field_Light","Open_Road","Forest_Mist","Reflection","Sunset_Valley","River_Bend","Autumn_Trees","Forest_Floor","Cliffs","Bridge","Pine_Lake","Snow_Peak","Waterfall","Stars_Night","Desert_Dunes","City_Skyline","Office_Window","Beach_Walk","Coffee_Morning","Aerial_Coast","Rolling_Hills","Ocean_Wave"];
const SIZES = ["2.4 MB","4.1 MB","3.7 MB","5.2 MB","1.8 MB","6.3 MB"];

const PHOTOS: Photo[] = RAW.map((u, i) => {
  const a = AGOS[i % AGOS.length];
  return {
    id: i,
    url: `https://images.unsplash.com/${u}?w=1800&q=85&auto=format&fit=crop`,
    thumb: `https://images.unsplash.com/${u}?w=600&h=450&q=70&auto=format&fit=crop`,
    account: ACCOUNTS[i % 3],
    ago: a.ago,
    daysAgo: a.d,
    size: SIZES[i % SIZES.length],
    name: `${NAMES[i]}.jpg`,
    emoji: EMOJIS[i],
    mood: MOODS[i % MOODS.length],
  };
});

const GRAIN = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
)}`;

function useLayout() {
  const { width, height } = useWindowSize();
  const isTouch = useIsTouch();
  const cols = width >= 1024 ? 5 : width >= 768 ? 4 : 3;
  const aspect = width >= 1024 ? 3 / 2 : 4 / 3;
  const panelPct = width >= 1024 ? 0.5 : width >= 768 ? 0.5 : 0.58;
  return { width, height, cols, aspect, panelPct, isTouch, isDesktop: width >= 1024 };
}

export function GalleryScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const L = useLayout();

  return (
    <div style={{ padding: "16px 0 96px", color: "#fff", fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 16px 14px" }}>
        Gallery
      </h1>

      <Grid
        onOpen={(i) => { setOpenIdx(i); setPanelOpen(false); }}
        dimmed={openIdx !== null}
        layout={L}
      />

      <AnimatePresence>
        {openIdx !== null && (
          <Fullscreen
            key="vf-fs"
            startIdx={openIdx}
            onClose={() => { setOpenIdx(null); setPanelOpen(false); }}
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
            layout={L}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- GRID ---------------- */

function Grid({
  onOpen, dimmed, layout,
}: { onOpen: (i: number) => void; dimmed: boolean; layout: ReturnType<typeof useLayout> }) {
  const { cols, aspect } = layout;
  const cellH = `calc((100vw - ${(cols - 1) * 3}px) / ${cols} / ${aspect})`;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: cellH,
        gap: 3,
        padding: "0 3px",
        touchAction: "pan-y",
      }}
    >
      {PHOTOS.map((p, i) => (
        <GridCell
          key={p.id}
          photo={p}
          index={i}
          onOpen={() => onOpen(i)}
          dimmed={dimmed}
          wide={(i + 1) % 5 === 0}
          isTouch={layout.isTouch}
        />
      ))}
    </div>
  );
}

function GridCell({
  photo, index, onOpen, dimmed, wide, isTouch,
}: { photo: Photo; index: number; onOpen: () => void; dimmed: boolean; wide: boolean; isTouch: boolean }) {
  const [breathing, setBreathing] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBreathing(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const dimAnim = { scale: 0.88, opacity: 0.3, filter: "blur(6px)" };
  const hoverAnim = !isTouch && hover
    ? { y: -4, scale: 1.02, filter: "blur(0px)", opacity: 1, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }
    : breathing
      ? { y: 0, scale: [1, 1.004, 1], filter: "blur(0px)", opacity: 1 }
      : { y: 0, scale: 1, filter: "blur(0px)", opacity: 1 };

  return (
    <motion.button
      layoutId={`vf-photo-${photo.id}`}
      onClick={onOpen}
      onPointerEnter={() => !isTouch && setHover(true)}
      onPointerLeave={() => !isTouch && setHover(false)}
      animate={dimmed ? dimAnim : hoverAnim}
      transition={
        dimmed
          ? { duration: 0.35 }
          : hover
            ? { duration: 0.2, ease: "easeOut" }
            : { duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: (index % 8) * 0.12 }
      }
      style={{
        position: "relative",
        padding: 0,
        border: "none",
        background: photo.mood.gradient,
        cursor: "pointer",
        gridColumn: wide ? "span 2" : "auto",
        borderRadius: 12,
        overflow: "hidden",
        contain: "layout style paint",
        willChange: "transform",
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.08)",
      }}
    >
      <img
        src={photo.thumb}
        alt={photo.name}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("${GRAIN}")`,
          opacity: 0.05,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.7))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", left: 8, bottom: 6,
          fontSize: 10, fontWeight: 300,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "-0.005em",
          pointerEvents: "none",
        }}
      >
        {photo.ago}
      </div>
      <div
        style={{
          position: "absolute", right: 8, bottom: 6,
          fontSize: 10, color: "rgba(255,255,255,0.4)",
          pointerEvents: "none",
        }}
      >
        ☁
      </div>
    </motion.button>
  );
}

/* ---------------- FULLSCREEN ---------------- */

function Fullscreen({
  startIdx, onClose, panelOpen, setPanelOpen, layout,
}: {
  startIdx: number;
  onClose: () => void;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
  layout: ReturnType<typeof useLayout>;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [chromeVisible, setChromeVisible] = useState(true);
  const { width: W, height: H, isDesktop, isTouch, panelPct } = layout;

  // Desktop fullscreen photo width = 85% of screen
  const photoW = isDesktop ? Math.floor(W * 0.85) : W;
  const slideStep = photoW; // distance to commit

  const x = useMotionValue(0);
  const panelY = useMotionValue(0);

  const current = PHOTOS[idx];
  const next = PHOTOS[(idx + 1) % PHOTOS.length];
  const prev = PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length];

  // Background mood mix
  const bg = useTransform(x, [-slideStep, 0, slideStep], [next.mood.deep, current.mood.deep, prev.mood.deep]);

  // Photo physics
  const curScale = useTransform(x, [-slideStep, 0, slideStep], [0.94, 1, 0.94]);
  const curBright = useTransform(x, [-slideStep, 0, slideStep], [0.65, 1, 0.65]);
  const curBlur = useTransform(x, [-slideStep, 0, slideStep], [4, 0, 4]);
  const curFilter = useTransform([curBright, curBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  const nextScale = useTransform(x, [-slideStep, 0], [1, 0.94]);
  const nextBright = useTransform(x, [-slideStep, 0], [1, 0.65]);
  const nextBlur = useTransform(x, [-slideStep, 0], [0, 4]);
  const nextFilter = useTransform([nextBright, nextBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  const prevScale = useTransform(x, [0, slideStep], [0.94, 1]);
  const prevBright = useTransform(x, [0, slideStep], [0.65, 1]);
  const prevBlur = useTransform(x, [0, slideStep], [4, 0]);
  const prevFilter = useTransform([prevBright, prevBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  // Panel system
  const PANEL_OPEN_Y = -H * panelPct;
  const photoScaleY = useTransform(panelY, [PANEL_OPEN_Y, 0], [0.8, 1]);
  const photoShiftY = useTransform(panelY, [PANEL_OPEN_Y, 0], [-28, 0]);

  function commitNext() {
    fmAnimate(x, -slideStep, {
      type: "spring", stiffness: 500, damping: 45,
      onComplete: () => { setIdx((i) => (i + 1) % PHOTOS.length); x.set(0); },
    });
  }
  function commitPrev() {
    fmAnimate(x, slideStep, {
      type: "spring", stiffness: 500, damping: 45,
      onComplete: () => { setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); x.set(0); },
    });
  }
  function snapBack() {
    fmAnimate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
  }

  function onDragEnd(_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) {
    const dx = info.offset.x; const dy = info.offset.y;
    const vx = info.velocity.x; const vy = info.velocity.y;
    if (dy > 60 || vy > 400) { if (Math.abs(dy) > Math.abs(dx)) { onClose(); return; } }
    if (dx < -80 || vx < -300) commitNext();
    else if (dx > 80 || vx > 300) commitPrev();
    else snapBack();
  }

  function togglePanel() {
    const shouldOpen = !panelOpen;
    fmAnimate(panelY, shouldOpen ? PANEL_OPEN_Y : 0, { type: "spring", stiffness: 500, damping: 50 });
    setPanelOpen(shouldOpen);
  }

  function onPanelDragEnd(_: any, info: { offset: { y: number } }) {
    const y = info.offset.y + (panelOpen ? PANEL_OPEN_Y : 0);
    const shouldOpen = y < PANEL_OPEN_Y / 2;
    fmAnimate(panelY, shouldOpen ? PANEL_OPEN_Y : 0, { type: "spring", stiffness: 500, damping: 50 });
    setPanelOpen(shouldOpen);
  }

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") commitPrev();
      else if (e.key === "ArrowRight") commitNext();
      else if (e.key === "Escape") onClose();
      else if (e.key === " ") { e.preventDefault(); togglePanel(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen, idx]);

  // Wheel nav on desktop
  const wheelLockRef = useRef(0);
  function onWheel(e: React.WheelEvent) {
    if (!isDesktop) return;
    const now = Date.now();
    if (now - wheelLockRef.current < 500) return;
    if (Math.abs(e.deltaX) < 30 && Math.abs(e.deltaY) < 30) return;
    wheelLockRef.current = now;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (d > 0) commitNext(); else commitPrev();
  }

  return (
    <motion.div
      onWheel={onWheel}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: bg,
        overflow: "hidden",
        touchAction: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Photo stack */}
      <motion.div
        style={{
          position: "absolute", inset: 0,
          scale: photoScaleY,
          y: photoShiftY,
          willChange: "transform",
        }}
        onClick={() => setChromeVisible((v) => !v)}
      >
        {/* Prev */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: isDesktop ? (W - photoW) / 2 : 0,
            width: photoW,
            x: useTransform(x, (v) => v - photoW),
            scale: prevScale,
            filter: prevFilter,
            willChange: "transform, filter",
          }}
        >
          <PhotoFrame photo={prev} />
        </motion.div>

        {/* Current — draggable */}
        <motion.div
          layoutId={`vf-photo-${PHOTOS[startIdx].id}`}
          drag={panelOpen ? false : "x"}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: isDesktop ? (W - photoW) / 2 : 0,
            width: photoW,
            x,
            scale: curScale,
            filter: curFilter,
            cursor: "grab",
            willChange: "transform, filter",
            borderRadius: 0,
          }}
          whileDrag={{ cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
        >
          <PhotoFrame photo={current} />
        </motion.div>

        {/* Next */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: isDesktop ? (W - photoW) / 2 : 0,
            width: photoW,
            x: useTransform(x, (v) => v + photoW),
            scale: nextScale,
            filter: nextFilter,
            willChange: "transform, filter",
          }}
        >
          <PhotoFrame photo={next} />
        </motion.div>
      </motion.div>

      {/* Top chrome */}
      <AnimatePresence>
        {chromeVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, zIndex: 6,
              padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                pointerEvents: "auto",
                width: 36, height: 36, borderRadius: 999,
                background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Back"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {current.name}
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                width: 36, height: 36, borderRadius: 999,
                background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Share"
            >
              <Share2 size={16} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop arrows */}
      {isDesktop && !isTouch && (
        <>
          <ArrowBtn side="left" onClick={(e) => { e.stopPropagation(); commitPrev(); }} />
          <ArrowBtn side="right" onClick={(e) => { e.stopPropagation(); commitNext(); }} />
        </>
      )}

      {/* Dot indicator */}
      <div style={{
        position: "absolute", bottom: 56, left: 0, right: 0, zIndex: 5,
        display: "flex", gap: 6, justifyContent: "center", pointerEvents: "none",
      }}>
        {PHOTOS.slice(Math.max(0, idx - 3), idx + 4).map((p, i) => {
          const isCurrent = p.id === current.id;
          return (
            <div key={p.id} style={{
              width: isCurrent ? 6 : 4,
              height: isCurrent ? 6 : 4,
              borderRadius: 999,
              background: isCurrent ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "all 200ms ease",
            }} />
          );
        })}
      </div>

      {/* Panel handle */}
      <motion.div
        drag="y"
        dragConstraints={{ top: PANEL_OPEN_Y, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={onPanelDragEnd}
        onClick={(e) => { e.stopPropagation(); togglePanel(); }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: "absolute", left: "50%", bottom: 16,
          translateX: "-50%", y: panelY,
          width: 80, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "none", cursor: "grab", zIndex: 10,
        }}
      >
        <div style={{ width: 28, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.6)" }} />
      </motion.div>

      {/* Memory panel */}
      <motion.div
        style={{
          position: "absolute",
          left: isDesktop ? (W - photoW) / 2 : 0,
          width: photoW,
          bottom: -H * panelPct,
          height: H * panelPct,
          y: panelY,
          background: "rgba(6,5,4,0.97)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderRadius: "24px 24px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "44px 24px 28px",
          willChange: "transform",
          zIndex: 8,
        }}
      >
        <MemoryPanel photo={current} />
      </motion.div>
    </motion.div>
  );
}

function ArrowBtn({ side, onClick }: { side: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        position: "absolute", top: "50%", [side]: 24,
        transform: "translateY(-50%)",
        opacity: hover ? 1 : 0.6,
        transition: "opacity 200ms ease",
        width: 48, height: 48, borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff", cursor: "pointer", zIndex: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
      } as any}
      aria-label={side}
    >
      {side === "left" ? <ChevronLeft size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
    </button>
  );
}

function PhotoFrame({ photo }: { photo: Photo }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: photo.mood.gradient }}>
      <img
        src={photo.url}
        alt={photo.name}
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" } as any}
      />
    </div>
  );
}

function MemoryPanel({ photo }: { photo: Photo }) {
  return (
    <div style={{ color: "#fff", textAlign: "center" }}>
      <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>{photo.emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em" }}>{photo.name}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
        Saved {photo.daysAgo} days ago
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 12,
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.8,
          textAlign: "left",
        }}
      >
        You have not opened this in {photo.daysAgo} days.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        {[photo.ago, photo.size, photo.account].map((s) => (
          <span key={s} style={{
            padding: "6px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)",
          }}>{s}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={{
          flex: 1, height: 46, borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>Keep</button>
        <button style={{
          flex: 1, height: 46, borderRadius: 14,
          background: "#4d90fe", border: "none",
          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>Archive</button>
      </div>
    </div>
  );
}
