import { useCallback, useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate as fmAnimate,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, ArrowLeft, Clock } from "lucide-react";
import { useWindowSize, useIsTouch } from "@/hooks/useWindowSize";

/* ---------------- DATA ---------------- */

type Mood = { name: string; gradient: string; deep: string };

const MOODS: Mood[] = [
  { name: "amber",  gradient: "linear-gradient(145deg,#2a1500,#5c3300)", deep: "#1a0d00" },
  { name: "night",  gradient: "linear-gradient(145deg,#00081f,#00103d)", deep: "#000516" },
  { name: "forest", gradient: "linear-gradient(145deg,#031403,#073507)", deep: "#020d02" },
  { name: "rose",   gradient: "linear-gradient(145deg,#180310,#3a0724)", deep: "#0f0209" },
  { name: "desert", gradient: "linear-gradient(145deg,#180d00,#3d2200)", deep: "#0d0700" },
  { name: "teal",   gradient: "linear-gradient(145deg,#001818,#003030)", deep: "#000f0f" },
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
  "photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba",
  "photo-1500382017468-9049fed747ef","photo-1469474968028-56623f02e42e",
  "photo-1470071459604-3b5ec3a7fe05","photo-1493246507139-91e8fad9978e",
  "photo-1418065460487-3e41a6c84dc5","photo-1501785888041-af3ef285b470",
  "photo-1502082553048-f009c37129b9","photo-1447752875215-b2761acb3c5d",
  "photo-1426604966848-d7adac402bff","photo-1485470733090-0aae1788d5af",
  "photo-1441974231531-c6227db76b6e","photo-1472214103451-9374bd1c798e",
  "photo-1433086966358-54859d0ed716","photo-1439066615861-d1af74d74000",
  "photo-1454496522488-7a8e488e8606","photo-1505765050516-f72dcac9c60e",
  "photo-1486312338219-ce68d2c6f44d","photo-1483347756197-71ef80e95f73",
  "photo-1444723121867-7a241cacace9","photo-1416879595882-3373a0480b5b",
  "photo-1500534314209-a25ddb2bd429","photo-1518837695005-2083093ee35b",
];
const AGOS = [
  { ago: "yesterday", d: 1 }, { ago: "last week", d: 7 },
  { ago: "2 weeks ago", d: 14 }, { ago: "1 month ago", d: 30 },
  { ago: "3 months ago", d: 90 }, { ago: "last year", d: 365 },
];
const ACCOUNTS: Photo["account"][] = ["Google Drive", "Dropbox", "OneDrive"];
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
    emoji: "📸",
    mood: MOODS[i % MOODS.length],
  };
});

const GRAIN = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
)}`;

/* ---------------- LAYOUT HOOK ---------------- */

function useLayout() {
  const { width, height } = useWindowSize();
  const isTouch = useIsTouch();
  const cols = width >= 1024 ? 5 : width >= 640 ? 4 : 3;
  const isDesktop = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  // side peek %
  const peekPct = isDesktop ? 0.11 : isTablet ? 0.14 : 0.10;
  const photoW = isDesktop ? Math.min(Math.floor(width * 0.78), width) : width;
  const panelPct = isDesktop ? 0.58 : isTablet ? 0.55 : 0.62;
  return { width, height, cols, isDesktop, isTablet, isTouch, peekPct, photoW, panelPct };
}

/* ---------------- ROOT ---------------- */

export function GalleryScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const L = useLayout();

  return (
    <LazyMotion features={domAnimation}>
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
    </LazyMotion>
  );
}

/* ---------------- GRID ---------------- */

function Grid({
  onOpen, dimmed, layout,
}: { onOpen: (i: number) => void; dimmed: boolean; layout: ReturnType<typeof useLayout> }) {
  const { cols } = layout;
  const cellH = `calc((100vw - ${(cols - 1) * 4}px - 8px) / ${cols} / (4/3))`;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: cellH,
        gap: 4,
        padding: "0 4px",
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
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBreathing(true), 4000);
    return () => clearTimeout(t);
  }, []);

  function handleClick() {
    setBreathing(false);
    setPulse(true);
    setTimeout(() => { onOpen(); setPulse(false); }, 60);
  }

  const dimAnim = { scale: 0.86, opacity: 0.25, filter: "blur(8px)" };
  const liveAnim = pulse
    ? { scale: [1, 1.08, 1], opacity: 1, filter: "blur(0px)", y: 0 }
    : (!isTouch && hover)
      ? { y: -6, scale: 1.03, opacity: 1, filter: "blur(0px)" }
      : breathing
        ? { y: 0, scale: [1, 1.005, 1], opacity: 1, filter: "blur(0px)" }
        : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" };

  return (
    <m.button
      layoutId={`vf-photo-${photo.id}`}
      onClick={handleClick}
      onPointerEnter={() => !isTouch && setHover(true)}
      onPointerLeave={() => !isTouch && setHover(false)}
      animate={dimmed ? dimAnim : liveAnim}
      transition={
        dimmed
          ? { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }
          : pulse
            ? { duration: 0.18, ease: "easeOut" }
            : hover
              ? { duration: 0.18, ease: "easeOut" }
              : breathing
                ? { duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: (index % 10) * 0.1 }
                : { duration: 0.2 }
      }
      style={{
        position: "relative",
        padding: 0,
        border: "none",
        background: photo.mood.gradient,
        cursor: "pointer",
        gridColumn: wide ? "span 2" : "auto",
        borderRadius: 14,
        overflow: "hidden",
        contain: "layout style paint",
        willChange: "transform, filter, opacity",
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)",
      }}
    >
      <img
        src={photo.thumb}
        alt={photo.name}
        loading="lazy"
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("${GRAIN}")`,
        opacity: 0.06, mixBlendMode: "overlay", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.65))",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: 8, bottom: 6,
        fontSize: 9, fontWeight: 300, color: "rgba(255,255,255,0.45)",
        letterSpacing: "-0.005em", pointerEvents: "none",
      }}>{photo.ago}</div>
      <div style={{
        position: "absolute", right: 8, bottom: 6,
        fontSize: 10, color: "rgba(255,255,255,0.35)", pointerEvents: "none",
      }}>☁</div>
    </m.button>
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
  const { width: W, height: H, isDesktop, isTouch, peekPct, photoW, panelPct } = layout;

  const slideStep = photoW; // sibling locked to current photo's edge ± photoW
  const sidePeek = Math.round(W * peekPct);
  const leftEdge = isDesktop ? Math.floor((W - photoW) / 2) : 0;

  const x = useMotionValue(0);
  const dragY = useMotionValue(0);
  const panelY = useMotionValue(0);

  const current = PHOTOS[idx];
  const next = PHOTOS[(idx + 1) % PHOTOS.length];
  const prev = PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length];

  // Background mood mix (3-stop)
  const bg = useTransform(x, [-slideStep, 0, slideStep], [next.mood.deep, current.mood.deep, prev.mood.deep]);

  // Current photo physics (horizontal swipe)
  const curScale = useTransform(x, [-slideStep, 0, slideStep], [0.88, 1, 0.88]);
  const curBright = useTransform(x, [-slideStep, 0, slideStep], [0.6, 1, 0.6]);
  const curBlur = useTransform(x, [-slideStep, 0, slideStep], [6, 0, 6]);
  const curFilter = useMotionTemplate`brightness(${curBright}) blur(${curBlur}px)`;

  // Next photo emerges from right peek
  const nextScale = useTransform(x, [-slideStep, 0], [1, 0.85]);
  const nextBright = useTransform(x, [-slideStep, 0], [1, 0.6]);
  const nextBlur = useTransform(x, [-slideStep, 0], [0, 8]);
  const nextOpacity = useTransform(x, [-slideStep, 0], [1, 0.4]);
  const nextFilter = useMotionTemplate`brightness(${nextBright}) blur(${nextBlur}px)`;
  // sits at right peek when x=0 → at center when x=-slideStep
  const nextX = useTransform(x, (v) => v + (photoW - sidePeek));

  // Prev photo at left peek
  const prevScale = useTransform(x, [0, slideStep], [0.85, 1]);
  const prevBright = useTransform(x, [0, slideStep], [0.6, 1]);
  const prevBlur = useTransform(x, [0, slideStep], [8, 0]);
  const prevOpacity = useTransform(x, [0, slideStep], [0.4, 1]);
  const prevFilter = useMotionTemplate`brightness(${prevBright}) blur(${prevBlur}px)`;
  const prevX = useTransform(x, (v) => v - (photoW - sidePeek));

  // Vertical dismiss
  const dismissScale = useTransform(dragY, [0, H * 0.5], [1, 0.6]);
  const dismissOpacity = useTransform(dragY, [0, H * 0.6], [1, 0.2]);

  // Panel
  const PANEL_OPEN_Y = -H * panelPct;
  const photoScaleY = useTransform(panelY, [PANEL_OPEN_Y, 0], [0.78, 1]);
  const photoShiftY = useTransform(panelY, [PANEL_OPEN_Y, 0], [-32, 0]);

  const commitNext = useCallback(() => {
    fmAnimate(x, -slideStep, {
      type: "spring", stiffness: 480, damping: 42,
      onComplete: () => { setIdx((i) => (i + 1) % PHOTOS.length); x.set(0); },
    });
  }, [x, slideStep]);

  const commitPrev = useCallback(() => {
    fmAnimate(x, slideStep, {
      type: "spring", stiffness: 480, damping: 42,
      onComplete: () => { setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); x.set(0); },
    });
  }, [x, slideStep]);

  const snapBack = useCallback(() => {
    fmAnimate(x, 0, { type: "spring", stiffness: 380, damping: 38 });
  }, [x]);

  function onDragEnd(_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) {
    const dx = info.offset.x, dy = info.offset.y;
    const vx = info.velocity.x, vy = info.velocity.y;
    if (dy > 55 || vy > 350) {
      if (Math.abs(dy) > Math.abs(dx)) { onClose(); return; }
    }
    fmAnimate(dragY, 0, { type: "spring", stiffness: 380, damping: 38 });
    if (dx < -70 || vx < -250) commitNext();
    else if (dx > 70 || vx > 250) commitPrev();
    else snapBack();
  }

  function togglePanel() {
    const shouldOpen = !panelOpen;
    fmAnimate(panelY, shouldOpen ? PANEL_OPEN_Y : 0, { type: "spring", stiffness: 520, damping: 52 });
    setPanelOpen(shouldOpen);
  }

  function onPanelDragEnd(_: any, info: { offset: { y: number } }) {
    const y = info.offset.y + (panelOpen ? PANEL_OPEN_Y : 0);
    const shouldOpen = y < PANEL_OPEN_Y / 2;
    fmAnimate(panelY, shouldOpen ? PANEL_OPEN_Y : 0, { type: "spring", stiffness: 520, damping: 52 });
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

  // Auto-hide chrome
  const hideTimer = useRef<number | null>(null);
  const bumpChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setChromeVisible(false), 3000);
  }, []);
  useEffect(() => {
    bumpChrome();
    return () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); };
  }, [bumpChrome, idx]);

  // Initial chrome: hide for 280ms, then fade in
  const [chromeReady, setChromeReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChromeReady(true), 280);
    return () => clearTimeout(t);
  }, []);

  return (
    <m.div
      onClick={bumpChrome}
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
      {/* World — scales/shifts on panel open + on vertical dismiss */}
      <m.div
        style={{
          position: "absolute", inset: 0,
          scale: photoScaleY,
          y: photoShiftY,
          willChange: "transform",
        }}
      >
        <m.div
          style={{
            position: "absolute", inset: 0,
            scale: dismissScale,
            opacity: dismissOpacity,
            y: dragY,
            willChange: "transform, opacity",
          }}
        >
          {/* PREV — always visible left peek */}
          <m.div
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: leftEdge, width: photoW,
              x: prevX,
              scale: prevScale,
              filter: prevFilter,
              opacity: prevOpacity,
              willChange: "transform, filter, opacity",
              pointerEvents: "none",
            }}
          >
            <PhotoFrame photo={prev} />
          </m.div>

          {/* NEXT — always visible right peek */}
          <m.div
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: leftEdge, width: photoW,
              x: nextX,
              scale: nextScale,
              filter: nextFilter,
              opacity: nextOpacity,
              willChange: "transform, filter, opacity",
              pointerEvents: "none",
            }}
          >
            <PhotoFrame photo={next} />
          </m.div>

          {/* CURRENT — draggable */}
          <m.div
            layoutId={`vf-photo-${PHOTOS[startIdx].id}`}
            drag={panelOpen ? false : true}
            dragElastic={0}
            dragMomentum={false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDrag={(_, info) => {
              // map vertical drag (down only)
              if (info.offset.y > 0) dragY.set(info.offset.y);
              else dragY.set(0);
            }}
            onDragEnd={onDragEnd}
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: leftEdge, width: photoW,
              x,
              scale: curScale,
              filter: curFilter,
              cursor: isTouch ? "grab" : "grab",
              willChange: "transform, filter",
              borderRadius: 0,
            }}
            whileDrag={{ cursor: "grabbing" }}
            transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.8 }}
          >
            <PhotoFrame photo={current} />
          </m.div>
        </m.div>
      </m.div>

      {/* Top chrome */}
      <AnimatePresence>
        {chromeReady && chromeVisible && (
          <m.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, zIndex: 6,
              padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                pointerEvents: "auto",
                width: 36, height: 36, borderRadius: 999,
                background: "transparent",
                border: "none",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.8))",
              }}
              aria-label="Back"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <div style={{
              fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.6)",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {idx + 1} of {PHOTOS.length}
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                width: 36, height: 36, borderRadius: 999,
                background: "transparent",
                border: "none",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.8))",
              }}
              aria-label="Share"
            >
              <Share2 size={18} strokeWidth={1.5} />
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Desktop arrows on hover */}
      {isDesktop && !isTouch && (
        <>
          <ArrowBtn side="left" onClick={(e) => { e.stopPropagation(); commitPrev(); }} />
          <ArrowBtn side="right" onClick={(e) => { e.stopPropagation(); commitNext(); }} />
        </>
      )}

      {/* Position dots */}
      <AnimatePresence>
        {chromeReady && chromeVisible && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", bottom: 60, left: 0, right: 0, zIndex: 5,
              display: "flex", gap: 6, justifyContent: "center", pointerEvents: "none",
            }}
          >
            {PHOTOS.slice(Math.max(0, idx - 3), idx + 4).map((p) => {
              const isCurrent = p.id === current.id;
              return (
                <div key={p.id} style={{
                  width: isCurrent ? 7 : 4,
                  height: isCurrent ? 7 : 4,
                  borderRadius: 999,
                  background: isCurrent ? "#fff" : "rgba(255,255,255,0.25)",
                  transition: "all 220ms ease",
                }} />
              );
            })}
          </m.div>
        )}
      </AnimatePresence>

      {/* Panel handle */}
      <m.div
        drag="y"
        dragConstraints={{ top: PANEL_OPEN_Y, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={onPanelDragEnd}
        onClick={(e) => { e.stopPropagation(); togglePanel(); }}
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: "absolute", left: "50%", bottom: 18,
          translateX: "-50%", y: panelY,
          width: 80, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "none", cursor: "grab", zIndex: 10,
        }}
      >
        <div style={{ width: 30, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.2)" }} />
      </m.div>

      {/* Memory panel */}
      <m.div
        style={{
          position: "absolute",
          left: isDesktop ? leftEdge : 0,
          width: photoW,
          bottom: -H * panelPct,
          height: H * panelPct,
          y: panelY,
          background: "rgba(5,4,3,0.97)",
          backdropFilter: "blur(48px) saturate(200%)",
          WebkitBackdropFilter: "blur(48px) saturate(200%)",
          borderRadius: "26px 26px 0 0",
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          padding: "20px 22px 28px",
          willChange: "transform",
          zIndex: 8,
        }}
      >
        <MemoryPanel photo={current} />
      </m.div>
    </m.div>
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
        opacity: hover ? 1 : 0.55,
        transition: "opacity 200ms ease",
        width: 48, height: 48, borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "0.5px solid rgba(255,255,255,0.1)",
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
    <div style={{
      position: "absolute", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: photo.mood.gradient,
      overflow: "hidden",
    }}>
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ width: 30, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.28)" }} />
      </div>
      <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 10 }}>{photo.emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.92)" }}>
        {photo.name}
      </div>
      <div style={{ fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
        Saved {photo.daysAgo} days ago
      </div>

      <div style={{ height: 0.5, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />

      <div
        style={{
          padding: 16,
          background: "rgba(255,255,255,0.025)",
          border: "0.5px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.8,
          textAlign: "left",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Clock size={14} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 2 }} />
        <div>You have not opened this in {photo.daysAgo} days. It was saved during a busy period.</div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {[photo.ago, photo.size, photo.account].map((s) => (
          <span key={s} style={{
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            fontSize: 11, color: "rgba(255,255,255,0.4)",
          }}>{s}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button style={{
          flex: 1, height: 48, borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Keep</button>
        <button style={{
          flex: 1, height: 48, borderRadius: 14,
          background: "#4d90fe", border: "none",
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Archive</button>
      </div>
    </div>
  );
}
