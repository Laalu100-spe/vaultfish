import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useDragControls,
  animate as fmAnimate,
} from "framer-motion";

type Mood = {
  name: string;
  gradient: string;
  deep: string;
  accent: string;
};

const MOODS: Mood[] = [
  { name: "amber", gradient: "linear-gradient(135deg,#3a2410 0%,#7a4a18 55%,#d4951f 100%)", deep: "#1a0f06", accent: "#d4951f" },
  { name: "navy", gradient: "linear-gradient(135deg,#070a1a 0%,#102045 55%,#2a4a8c 100%)", deep: "#03050d", accent: "#2a4a8c" },
  { name: "forest", gradient: "linear-gradient(135deg,#0a1a10 0%,#1d3a24 55%,#3d7a48 100%)", deep: "#04090a", accent: "#3d7a48" },
  { name: "rose", gradient: "linear-gradient(135deg,#2a1418 0%,#5a2a30 55%,#b85a68 100%)", deep: "#140a0c", accent: "#b85a68" },
  { name: "desert", gradient: "linear-gradient(135deg,#241608 0%,#6a3a18 55%,#c47438 100%)", deep: "#100806", accent: "#c47438" },
  { name: "teal", gradient: "linear-gradient(135deg,#04181c 0%,#0e3a44 55%,#1e7a8a 100%)", deep: "#02090b", accent: "#1e7a8a" },
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
  { ago: "yesterday", d: 1 }, { ago: "3 days ago", d: 3 }, { ago: "1 week ago", d: 7 },
  { ago: "2 weeks ago", d: 14 }, { ago: "1 month ago", d: 30 }, { ago: "3 months ago", d: 90 },
  { ago: "6 months ago", d: 180 }, { ago: "9 months ago", d: 270 },
];
const ACCOUNTS: Photo["account"][] = ["Google Drive", "Dropbox", "OneDrive"];
const EMOJIS = ["🏔️", "🌊", "🌅", "🛣️", "🌲", "💭", "🌄", "🏞️", "🍂", "🌳", "⛰️", "🌉", "🏕️", "❄️", "💧", "✨", "🏜️", "🌃", "🪟", "🏖️", "☕", "🛩️", "🌾", "🌊"];
const NAMES = ["Mountain_Sunrise", "Alpine_Lake", "Field_Light", "Open_Road", "Forest_Mist", "Reflection", "Sunset_Valley", "River_Bend", "Autumn_Trees", "Forest_Floor", "Cliffs", "Bridge", "Pine_Lake", "Snow_Peak", "Waterfall", "Stars_Night", "Desert_Dunes", "City_Skyline", "Office_Window", "Beach_Walk", "Coffee_Morning", "Aerial_Coast", "Rolling_Hills", "Ocean_Wave"];
const SIZES = ["2.4 MB", "4.1 MB", "3.7 MB", "5.2 MB", "1.8 MB", "6.3 MB"];

const PHOTOS: Photo[] = RAW.map((u, i) => {
  const a = AGOS[i % AGOS.length];
  return {
    id: i,
    url: `https://images.unsplash.com/${u}?w=1600&q=85&auto=format&fit=crop`,
    thumb: `https://images.unsplash.com/${u}?w=500&h=500&q=70&auto=format&fit=crop`,
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

export function GalleryScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div style={{ padding: "16px 0 96px", color: "#fff", fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 16px 14px" }}>
        Gallery
      </h1>

      <Grid onOpen={(i) => { setOpenIdx(i); setPanelOpen(false); }} dimmed={openIdx !== null} />

      <AnimatePresence>
        {openIdx !== null && (
          <Fullscreen
            key="vf-fs"
            startIdx={openIdx}
            onClose={() => { setOpenIdx(null); setPanelOpen(false); }}
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- GRID ---------------- */

function Grid({ onOpen, dimmed }: { onOpen: (i: number) => void; dimmed: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "33.333vw",
        gap: 2,
      }}
    >
      {PHOTOS.map((p, i) => (
        <GridCell key={p.id} photo={p} index={i} onOpen={() => onOpen(i)} dimmed={dimmed} />
      ))}
    </div>
  );
}

function GridCell({
  photo, index, onOpen, dimmed,
}: { photo: Photo; index: number; onOpen: () => void; dimmed: boolean }) {
  const tall = (index + 1) % 4 === 0;
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBreathing(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.button
      layoutId={`vf-photo-${photo.id}`}
      onClick={onOpen}
      animate={
        dimmed
          ? { scale: 0.9, filter: "blur(4px)" }
          : breathing
            ? { scale: [1, 1.005, 1], filter: "blur(0px)" }
            : { scale: 1, filter: "blur(0px)" }
      }
      transition={
        dimmed
          ? { duration: 0.4 }
          : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: (index % 6) * 0.6 }
      }
      style={{
        position: "relative",
        padding: 0,
        border: "none",
        background: photo.mood.gradient,
        cursor: "pointer",
        gridRow: tall ? "span 2" : "auto",
        overflow: "hidden",
        contain: "layout style paint",
        willChange: "transform",
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
          opacity: 0.06,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 8, right: 8, bottom: 6,
          fontSize: 10, fontWeight: 300,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "-0.005em",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      >
        {photo.ago}
      </div>
    </motion.button>
  );
}

/* ---------------- FULLSCREEN ---------------- */

function Fullscreen({
  startIdx, onClose, panelOpen, setPanelOpen,
}: {
  startIdx: number;
  onClose: () => void;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const widthRef = useRef(typeof window !== "undefined" ? window.innerWidth : 375);
  const heightRef = useRef(typeof window !== "undefined" ? window.innerHeight : 700);

  useEffect(() => {
    const onR = () => {
      widthRef.current = window.innerWidth;
      heightRef.current = window.innerHeight;
    };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const x = useMotionValue(0);
  const panelY = useMotionValue(0);
  const dragControls = useDragControls();

  const current = PHOTOS[idx];
  const next = PHOTOS[(idx + 1) % PHOTOS.length];
  const prev = PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length];

  const W = widthRef.current;
  const H = heightRef.current;

  // Background mood mix based on drag
  const bg = useTransform(x, [-W, 0, W], [next.mood.deep, current.mood.deep, prev.mood.deep]);

  // Photo scale / brightness / blur per side
  const curScale = useTransform(x, [-W, 0, W], [0.92, 1, 0.92]);
  const curBrightness = useTransform(x, [-W, 0, W], [0.7, 1, 0.7]);
  const curBlur = useTransform(x, [-W, 0, W], [3, 0, 3]);
  const curFilter = useTransform([curBrightness, curBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  const nextScale = useTransform(x, [-W, 0], [1, 0.88]);
  const nextBrightness = useTransform(x, [-W, 0], [1, 0.7]);
  const nextBlur = useTransform(x, [-W, 0], [0, 3]);
  const nextFilter = useTransform([nextBrightness, nextBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  const prevScale = useTransform(x, [0, W], [0.88, 1]);
  const prevBrightness = useTransform(x, [0, W], [0.7, 1]);
  const prevBlur = useTransform(x, [0, W], [3, 0]);
  const prevFilter = useTransform([prevBrightness, prevBlur] as any, ([b, bl]: any) => `brightness(${b}) blur(${bl}px)`);

  // Panel system - photo above moves with panel
  const PANEL_OPEN_Y = -H * 0.6;
  const photoScaleY = useTransform(panelY, [PANEL_OPEN_Y, 0], [0.82, 1]);
  const photoShiftY = useTransform(panelY, [PANEL_OPEN_Y, 0], [-H * 0.1, 0]);

  function snapTo(target: number, after?: () => void) {
    fmAnimate(x, target, {
      type: "spring", stiffness: 500, damping: 45,
      onComplete: () => { x.set(0); after?.(); },
    });
  }

  function onDragEnd(_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) {
    const dx = info.offset.x;
    const dy = info.offset.y;

    // Vertical dismiss
    if (dy > 100 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }

    if (dx < -75) {
      fmAnimate(x, -W, {
        type: "spring", stiffness: 500, damping: 45,
        onComplete: () => {
          setIdx((i) => (i + 1) % PHOTOS.length);
          x.set(0);
        },
      });
    } else if (dx > 75) {
      fmAnimate(x, W, {
        type: "spring", stiffness: 500, damping: 45,
        onComplete: () => {
          setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
          x.set(0);
        },
      });
    } else {
      snapTo(0);
    }
  }

  function onPanelDragEnd(_: any, info: { offset: { y: number }; velocity: { y: number } }) {
    const y = info.offset.y + (panelOpen ? PANEL_OPEN_Y : 0);
    const shouldOpen = y < PANEL_OPEN_Y / 2;
    fmAnimate(panelY, shouldOpen ? PANEL_OPEN_Y : 0, { type: "spring", stiffness: 400, damping: 38 });
    setPanelOpen(shouldOpen);
  }

  return (
    <motion.div
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
      >
        {/* Prev (enters from left when dragging right) */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            x: useTransform(x, (v) => v - W),
            scale: prevScale,
            filter: prevFilter,
            willChange: "transform, filter",
          }}
        >
          <PhotoFrame photo={prev} />
        </motion.div>

        {/* Current */}
        <motion.div
          layoutId={`vf-photo-${PHOTOS[startIdx].id}`}
          drag={panelOpen ? false : "x"}
          dragControls={dragControls}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={{
            position: "absolute", inset: 0,
            x,
            scale: curScale,
            filter: curFilter,
            cursor: "grab",
            willChange: "transform, filter",
          }}
          whileDrag={{ cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <PhotoFrame photo={current} />
        </motion.div>

        {/* Next (enters from right when dragging left) */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            x: useTransform(x, (v) => v + W),
            scale: nextScale,
            filter: nextFilter,
            willChange: "transform, filter",
          }}
        >
          <PhotoFrame photo={next} />
        </motion.div>
      </motion.div>

      {/* Close (tap top) */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 5,
          width: 36, height: 36, borderRadius: 999,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff", fontSize: 18, fontWeight: 300, cursor: "pointer",
        }}
      >
        ✕
      </button>

      {/* Drag handle */}
      <motion.div
        drag="y"
        dragConstraints={{ top: PANEL_OPEN_Y, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={onPanelDragEnd}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 20,
          translateX: "-50%",
          y: panelY,
          width: 80, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "none",
          cursor: "grab",
          zIndex: 10,
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.6)" }} />
      </motion.div>

      {/* Memory Panel */}
      <motion.div
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: -H * 0.6,
          height: H * 0.6,
          y: panelY,
          background: "rgba(8,6,4,0.96)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderRadius: "28px 28px 0 0",
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

function PhotoFrame({ photo }: { photo: Photo }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: photo.mood.gradient }}>
      <img
        src={photo.url}
        alt={photo.name}
        draggable={false}
        style={{
          maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
          userSelect: "none",
        } as any}
      />
    </div>
  );
}

function MemoryPanel({ photo }: { photo: Photo }) {
  return (
    <div style={{ color: "#fff", textAlign: "center" }}>
      <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 14 }}>{photo.emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.015em" }}>{photo.name}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
        Saved {photo.daysAgo} days ago
      </div>

      <div
        style={{
          marginTop: 22,
          padding: "14px 16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 14,
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.7,
          textAlign: "left",
        }}
      >
        You saved this during a busy week. You have not opened it since.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
        {[photo.ago, photo.size, photo.account].map((s) => (
          <span
            key={s}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11, fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button
          style={{
            flex: 1, height: 46, borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          Keep
        </button>
        <button
          style={{
            flex: 1, height: 46, borderRadius: 14,
            background: "#4d90fe",
            border: "none",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          Archive
        </button>
      </div>
    </div>
  );
}
