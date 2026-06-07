import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, LazyMotion, domAnimation, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, Cloud, X } from "lucide-react";
import { useWindowSize } from "@/hooks/useWindowSize";

type Photo = {
  id: string;
  url: string;
  gradient: string;
  moodDeep: string;
  timeAgo: string;
  source: string;
  filename: string;
  emoji: string;
};

const GRADIENTS = [
  { g: "linear-gradient(145deg, #2a1500, #5c3300)", deep: "#3a1d00" },
  { g: "linear-gradient(145deg, #00081f, #00103d)", deep: "#000c2e" },
  { g: "linear-gradient(145deg, #031403, #073507)", deep: "#052305" },
  { g: "linear-gradient(145deg, #180310, #3a0724)", deep: "#26051a" },
  { g: "linear-gradient(145deg, #180d00, #3d2200)", deep: "#241400" },
  { g: "linear-gradient(145deg, #001818, #003030)", deep: "#002323" },
];

const EMOJIS = ["🌅", "🏖️", "🌊", "🌸", "🍂", "⛰️", "🌃", "✨", "🌙", "🔥", "🌿", "🎞️"];
const SOURCES = ["Google Drive", "Dropbox", "OneDrive", "iCloud"];
const TIMES = ["2m ago", "1h ago", "3h ago", "Yesterday", "2d ago", "1w ago", "Mar 14", "Feb 02", "47d ago"];
const NAMES = [
  "Sunset.jpg", "Beach Day.jpg", "Ocean View.png", "Cherry Blossom.jpg",
  "Autumn Walk.jpg", "Summit.jpg", "City Lights.png", "Sparkle.jpg",
  "Moonrise.jpg", "Bonfire.jpg", "Garden.jpg", "Film Roll.jpg",
];

const PHOTOS: Photo[] = Array.from({ length: 100 }, (_, i) => {
  const grad = GRADIENTS[i % GRADIENTS.length];
  return {
    id: `photo-${i}`,
    url: `https://picsum.photos/seed/vf${i}/800/600`,
    gradient: grad.g,
    moodDeep: grad.deep,
    timeAgo: TIMES[i % TIMES.length],
    source: SOURCES[i % SOURCES.length],
    filename: `${NAMES[i % NAMES.length].replace(".jpg", "").replace(".png", "")} ${i + 1}.jpg`,
    emoji: EMOJIS[i % EMOJIS.length],
  };
});

export function GalleryScreen() {
  const { width: winW } = useWindowSize();
  const isDesktop = winW >= 900;
  const [selected, setSelected] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelOrigin, setPanelOrigin] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [activeTab, setActiveTab] = useState<"details" | "location" | "actions">("details");
  const [chromeVisible, setChromeVisible] = useState(true);

  const x = useMotionValue(0);
  const dragY = useMotionValue(0);
  const photoW = isDesktop ? Math.min(winW * 0.78, 1100) : winW;
  const sidePeek = isDesktop ? winW * 0.11 : winW * 0.1;
  const slideStep = photoW - sidePeek;

  const total = PHOTOS.length;
  const current = selected !== null ? PHOTOS[selected] : null;
  const prev = selected !== null && selected > 0 ? PHOTOS[selected - 1] : null;
  const next = selected !== null && selected < total - 1 ? PHOTOS[selected + 1] : null;

  // Transforms for liquid swiping
  const currentScale = useTransform(x, [-slideStep, 0, slideStep], [0.9, 1, 0.9]);
  const currentFilter = useTransform(x, [-slideStep, 0, slideStep], [
    "blur(5px) brightness(0.6)",
    "blur(0px) brightness(1)",
    "blur(5px) brightness(0.6)",
  ]);
  const nextScale = useTransform(x, [-slideStep, 0], [1, 0.88]);
  const nextBlur = useTransform(x, [-slideStep, 0], ["0px", "8px"]);
  const prevScale = useTransform(x, [0, slideStep], [0.88, 1]);
  const prevBlur = useTransform(x, [0, slideStep], ["8px", "0px"]);

  const bgColor = useTransform(
    x,
    [-slideStep, 0, slideStep],
    [next?.moodDeep || current?.moodDeep || "#000", current?.moodDeep || "#000", prev?.moodDeep || current?.moodDeep || "#000"]
  );

  const close = () => {
    setPanelOpen(false);
    setSelected(null);
    x.set(0);
  };

  const go = (dir: 1 | -1) => {
    if (selected === null) return;
    const target = selected + dir;
    if (target < 0 || target >= total) {
      x.set(0);
      return;
    }
    setSelected(target);
    x.set(0);
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    const dx = info.offset.x;
    const vx = info.velocity.x;
    if ((dx < -70 || vx < -250) && next) {
      go(1);
    } else if ((dx > 70 || vx > 250) && prev) {
      go(-1);
    } else {
      x.set(0);
    }
  };

  const onVerticalDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 55 || info.velocity.y > 350) {
      close();
    } else {
      dragY.set(0);
    }
  };

  // Keyboard
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Escape") {
        if (panelOpen) setPanelOpen(false);
        else close();
      } else if (e.key === " " || e.key.toLowerCase() === "i") {
        e.preventDefault();
        setPanelOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, panelOpen, next, prev]);

  // Auto-hide chrome
  useEffect(() => {
    if (selected === null) return;
    setChromeVisible(true);
    const t = setTimeout(() => setChromeVisible(false), 3000);
    return () => clearTimeout(t);
  }, [selected]);

  const onPhotoTap = (e: React.MouseEvent | React.TouchEvent) => {
    const t = "touches" in e ? e.changedTouches[0] : e;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ox = ((t as any).clientX - rect.left) / rect.width;
    const oy = ((t as any).clientY - rect.top) / rect.height;
    setPanelOrigin({ x: ox, y: oy });
    setPanelOpen(true);
    setChromeVisible(true);
  };

  // Filmstrip ref to scroll active into view
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected === null || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-strip-idx="${selected}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  const cells = useMemo(() => PHOTOS, []);
  const cols = isDesktop ? 5 : 3;

  return (
    <LazyMotion features={domAnimation}>
      <div style={{ padding: "16px 12px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "8px 4px 16px", letterSpacing: "-0.02em" }}>
          Gallery
        </h1>

        <div className="vf-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cells.map((p, i) => {
            const isWide = (i + 1) % 5 === 0;
            return (
              <motion.button
                key={p.id}
                layoutId={`vf-card-${p.id}`}
                onClick={() => setSelected(i)}
                className="vf-cell"
                animate={selected === null ? { scale: [1, 1.005, 1] } : { scale: 1 }}
                transition={
                  selected === null
                    ? { duration: 5, repeat: Infinity, delay: (i % 10) * 0.1, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
                whileTap={{ scale: 1.07, transition: { duration: 0.1 } }}
                style={{
                  background: p.gradient,
                  gridColumn: isWide ? "span 2" : undefined,
                  aspectRatio: isWide ? "2 / 1" : "4 / 3",
                }}
                aria-label={p.filename}
              >
                <img
                  src={p.url}
                  alt={p.filename}
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="vf-grain" />
                <div className="vf-vignette" />
                <span className="vf-timeago">{p.timeAgo}</span>
                <Cloud size={10} style={{ position: "absolute", right: 6, bottom: 5, opacity: 0.35, color: "#fff" }} />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected !== null && current && (
            <motion.div
              className="vf-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: bgColor }}
              onClick={() => setChromeVisible((v) => !v)}
            >
              {/* Side peeks (static layer) */}
              {prev && (
                <motion.div
                  className="vf-peek vf-peek-l"
                  style={{
                    background: prev.gradient,
                    backgroundImage: `url(${prev.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    scale: prevScale,
                    filter: useTransform(prevBlur, (v) => `blur(${v}) brightness(0.6)`),
                  }}
                />
              )}
              {next && (
                <motion.div
                  className="vf-peek vf-peek-r"
                  style={{
                    background: next.gradient,
                    backgroundImage: `url(${next.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    scale: nextScale,
                    filter: useTransform(nextBlur, (v) => `blur(${v}) brightness(0.6)`),
                  }}
                />
              )}

              {/* Draggable film strip */}
              <motion.div
                className="vf-strip"
                drag="x"
                dragElastic={0}
                style={{ x }}
                onDragEnd={onDragEnd}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Prev */}
                {prev && (
                  <div className="vf-slot" style={{ left: -slideStep, width: photoW }}>
                    <img src={prev.url} alt="" className="vf-photo-img" draggable={false} />
                  </div>
                )}
                {/* Current */}
                <motion.div
                  className="vf-slot vf-slot-current"
                  style={{
                    left: 0,
                    width: photoW,
                    scale: currentScale,
                    y: dragY,
                  }}
                  drag="y"
                  dragElastic={0.2}
                  dragConstraints={{ top: 0, bottom: 400 }}
                  onDragEnd={onVerticalDragEnd}
                >
                  <motion.div
                    layoutId={`vf-card-${current.id}`}
                    transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.9 }}
                    style={{ width: "100%", height: "100%", borderRadius: 0, overflow: "hidden", background: current.gradient }}
                  >
                    <motion.img
                      src={current.url}
                      alt={current.filename}
                      className="vf-photo-img"
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhotoTap(e);
                      }}
                      style={{
                        filter: useTransform([currentBlur, currentBright], ([b, br]: any) => `blur(${b}) brightness(${br})`),
                      }}
                    />
                  </motion.div>
                </motion.div>
                {/* Next */}
                {next && (
                  <div className="vf-slot" style={{ left: slideStep, width: photoW }}>
                    <img src={next.url} alt="" className="vf-photo-img" draggable={false} />
                  </div>
                )}
              </motion.div>

              {/* Top bar */}
              <AnimatePresence>
                {chromeVisible && (
                  <motion.div
                    className="vf-topbar"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={close} className="vf-iconbtn" aria-label="Back">
                      <ChevronLeft size={24} color="#fff" />
                    </button>
                    <span style={{ fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.7)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                      {selected + 1} of {total}
                    </span>
                    <button className="vf-iconbtn" aria-label="Share">
                      <Share2 size={20} color="#fff" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop arrows */}
              {isDesktop && chromeVisible && (
                <>
                  {prev && (
                    <button
                      className="vf-arrow vf-arrow-l"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(-1);
                      }}
                    >
                      <ChevronLeft size={20} color="#fff" />
                    </button>
                  )}
                  {next && (
                    <button
                      className="vf-arrow vf-arrow-r"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(1);
                      }}
                    >
                      <ChevronRight size={20} color="#fff" />
                    </button>
                  )}
                </>
              )}

              {/* Dots */}
              <div className="vf-dots" onClick={(e) => e.stopPropagation()}>
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
                        background: active ? "#fff" : "rgba(255,255,255,0.25)",
                        transition: "all 200ms ease",
                      }}
                    />
                  );
                })}
              </div>

              {/* Filmstrip */}
              <AnimatePresence>
                {chromeVisible && !panelOpen && (
                  <motion.div
                    className="vf-filmstrip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                    ref={stripRef}
                  >
                    {PHOTOS.map((p, i) => (
                      <button
                        key={p.id}
                        data-strip-idx={i}
                        onClick={() => setSelected(i)}
                        className="vf-thumb"
                        style={{
                          outline: i === selected ? "2px solid #fff" : "none",
                          transform: i === selected ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <img src={p.url} alt="" loading="lazy" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info panel — liquid pour */}
              <AnimatePresence>
                {panelOpen && (
                  <motion.div
                    className="vf-panel"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ transformOrigin: `${panelOrigin.x * 100}% ${panelOrigin.y * 100}%` }}
                    onClick={(e) => e.stopPropagation()}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 400 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 80 || info.velocity.y > 350) setPanelOpen(false);
                    }}
                  >
                    <div className="vf-panel-handle" />
                    {[
                      <div key="emoji" style={{ fontSize: 48, lineHeight: 1 }}>{current.emoji}</div>,
                      <div key="name" style={{ marginTop: 10, fontFamily: "Inter", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{current.filename}</div>,
                      <div key="time" style={{ marginTop: 4, fontFamily: "Inter", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Saved {current.timeAgo}</div>,
                      <div key="tabs" className="vf-tabs">
                        {(["details", "location", "actions"] as const).map((t) => (
                          <button key={t} onClick={() => setActiveTab(t)} className="vf-tab" style={{ color: activeTab === t ? "#fff" : "rgba(255,255,255,0.5)" }}>
                            {t[0].toUpperCase() + t.slice(1)}
                            {activeTab === t && <motion.div layoutId="tab-indic" className="vf-tab-indic" />}
                          </button>
                        ))}
                      </div>,
                      <div key="body" style={{ width: "100%", marginTop: 14 }}>
                        {activeTab === "details" && (
                          <>
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
                              You saved this {current.timeAgo}. You haven't opened it since.
                            </div>
                            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                              {[current.timeAgo, "4.2 MB", current.source].map((s) => (
                                <span key={s} style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.05)", fontFamily: "Inter", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{s}</span>
                              ))}
                            </div>
                            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                              <button className="vf-btn vf-btn-ghost">Keep</button>
                              <button className="vf-btn vf-btn-primary">Archive</button>
                            </div>
                          </>
                        )}
                        {activeTab === "location" && (
                          <div style={{ fontFamily: "Inter", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                            <div className="vf-row">{current.source}</div>
                            <div className="vf-row">/Photos/2024</div>
                            <div className="vf-row">/Memories</div>
                          </div>
                        )}
                        {activeTab === "actions" && (
                          <div style={{ fontFamily: "Inter", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                            {["Move", "Copy", "Share", "Rename", "Delete"].map((a) => (
                              <div key={a} className="vf-row">{a}</div>
                            ))}
                          </div>
                        )}
                      </div>,
                    ].map((el, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                      >
                        {el}
                      </motion.div>
                    ))}
                    <button onClick={() => setPanelOpen(false)} className="vf-panel-close" aria-label="Close">
                      <X size={16} color="#fff" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .vf-grid { display: grid; gap: 3px; }
          .vf-cell {
            position: relative; border-radius: 10px; overflow: hidden;
            cursor: pointer; border: none; padding: 0;
            contain: layout style paint;
            will-change: transform;
          }
          @media (hover: hover) {
            .vf-cell:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 10px 36px rgba(0,0,0,0.5); transition: all 180ms ease; }
          }
          .vf-grain {
            position: absolute; inset: 0; opacity: 0.05; pointer-events: none;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          }
          .vf-vignette {
            position: absolute; left:0; right:0; bottom:0; height: 50%;
            background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.65));
            pointer-events: none;
          }
          .vf-timeago {
            position: absolute; left: 6px; bottom: 5px;
            font-family: Inter; font-size: 9px;
            color: rgba(255,255,255,0.45); font-weight: 500;
          }
          .vf-overlay {
            position: fixed; inset: 0; z-index: 1000;
            overflow: hidden;
            touch-action: none;
          }
          .vf-peek {
            position: absolute; top: 0; bottom: 0;
            width: 12%;
            opacity: 0.35; pointer-events: none; z-index: 1;
            will-change: transform, filter;
          }
          .vf-peek-l { left: 0; }
          .vf-peek-r { right: 0; }
          .vf-strip {
            position: absolute; inset: 0;
            z-index: 2;
            cursor: grab;
            will-change: transform;
          }
          .vf-strip:active { cursor: grabbing; }
          .vf-slot {
            position: absolute; top: 0; height: 100%;
            display: flex; align-items: center; justify-content: center;
            will-change: transform, filter;
          }
          .vf-photo-img {
            width: 100%; height: 100%;
            object-fit: contain;
            user-select: none;
            -webkit-user-drag: none;
            will-change: transform, filter;
          }
          .vf-topbar {
            position: absolute; top: 0; left: 0; right: 0;
            padding: 16px 20px;
            display: flex; align-items: center; justify-content: space-between;
            height: 64px; z-index: 30;
          }
          .vf-iconbtn {
            background: rgba(0,0,0,0.25); backdrop-filter: blur(8px);
            border: none; cursor: pointer; padding: 8px; border-radius: 999px;
            display: flex; align-items: center; justify-content: center;
          }
          .vf-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 48px; height: 48px; border-radius: 999px;
            background: rgba(255,255,255,0.08); backdrop-filter: blur(8px);
            border: none; cursor: pointer; z-index: 25;
            display: flex; align-items: center; justify-content: center;
          }
          .vf-arrow-l { left: 16px; }
          .vf-arrow-r { right: 16px; }
          .vf-dots {
            position: absolute; left: 50%; bottom: 92px;
            transform: translateX(-50%);
            display: flex; align-items: center; gap: 6px;
            z-index: 15;
          }
          .vf-filmstrip {
            position: absolute; left: 0; right: 0; bottom: 0;
            height: 68px;
            display: flex; gap: 4px;
            padding: 6px 12px;
            overflow-x: auto;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
            z-index: 12;
            scrollbar-width: none;
          }
          .vf-filmstrip::-webkit-scrollbar { display: none; }
          .vf-thumb {
            flex: 0 0 auto;
            width: 56px; height: 56px;
            border-radius: 4px; overflow: hidden;
            border: none; padding: 0; cursor: pointer;
            background: #111;
            transition: transform 200ms ease;
          }
          .vf-thumb img { width: 100%; height: 100%; object-fit: cover; }
          .vf-panel {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 55vh;
            background: rgba(5,4,3,0.97);
            backdrop-filter: blur(48px);
            -webkit-backdrop-filter: blur(48px);
            border-radius: 24px 24px 0 0;
            z-index: 40;
            display: flex; flex-direction: column; align-items: center;
            padding: 16px 24px 32px;
            will-change: transform, opacity;
            overflow-y: auto;
          }
          .vf-panel-handle {
            width: 36px; height: 4px; border-radius: 999px;
            background: rgba(255,255,255,0.2); margin-bottom: 14px;
            flex: 0 0 auto;
          }
          .vf-panel-close {
            position: absolute; top: 12px; right: 12px;
            background: rgba(255,255,255,0.08); border: none;
            border-radius: 999px; width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
          }
          .vf-tabs {
            display: flex; gap: 18px; margin-top: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding-bottom: 8px; width: 100%; justify-content: center;
          }
          .vf-tab {
            position: relative; background: transparent; border: none;
            font-family: Inter; font-size: 12px; font-weight: 500;
            cursor: pointer; padding: 4px 2px;
          }
          .vf-tab-indic {
            position: absolute; left: 0; right: 0; bottom: -9px;
            height: 2px; background: #4d90fe; border-radius: 2px;
          }
          .vf-btn {
            flex: 1; padding: 12px 0; border-radius: 12px;
            font-family: Inter; font-size: 13px; font-weight: 600;
            border: none; cursor: pointer; color: #fff;
          }
          .vf-btn-ghost { background: rgba(255,255,255,0.06); font-weight: 500; }
          .vf-btn-primary { background: #4d90fe; }
          .vf-row {
            padding: 12px 14px; border-radius: 10px;
            background: rgba(255,255,255,0.03);
            margin-bottom: 6px;
          }
        `}</style>
      </div>
    </LazyMotion>
  );
}
