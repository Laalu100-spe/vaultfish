import { useMemo, useState, type ReactNode } from "react";
import { SectionTitle } from "../ui";
import { ChevronDown, Check } from "lucide-react";
import { DecreasingLinesIcon } from "../PlatformIcons";

function DuplicateIcon({ color = "#a78bfa" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="5" width="10" height="10" rx="1.5" stroke={color} strokeWidth={1.5} fill="none" />
      <rect x="7" y="9" width="10" height="10" rx="1.5" stroke={color} strokeWidth={1.5} fill="none" />
    </svg>
  );
}
function VideoIcon({ color = "#fb923c" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M8.5 7.2 L13.2 10 L8.5 12.8 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function ClockIcon({ color = "#facc15" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M10 5.8 V10 L13 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function ScreenshotIcon({ color = "#4d90fe" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2.5" y="4.5" width="13" height="11" rx="1.5" stroke={color} strokeWidth={1.5} fill="none" />
      <circle cx="15.5" cy="15.5" r="2" stroke={color} strokeWidth={1.5} fill="none" />
    </svg>
  );
}

// ---------- Thumbnails ----------
function MountainThumb({ tint }: { tint?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <linearGradient id="mtBg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2d6a9f" />
          <stop offset="100%" stopColor="#1a3a5c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#mtBg)" />
      <circle cx="36" cy="12" r="4" fill="#fef3c7" opacity="0.85" />
      <polygon points="0,38 12,20 22,30 32,16 48,36 48,48 0,48" fill="#0f1f33" opacity="0.9" />
      <polygon points="9,28 13,24 18,28" fill="#fff" opacity="0.7" />
      {tint && <rect width="48" height="48" fill={tint} opacity="0.28" />}
    </svg>
  );
}

function SunsetThumb({ tint }: { tint?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <linearGradient id="suBg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#7a1d1d" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#suBg)" />
      <circle cx="24" cy="28" r="7" fill="#fde047" opacity="0.95" />
      <rect y="30" width="48" height="18" fill="#1a0808" opacity="0.85" />
      {tint && <rect width="48" height="48" fill={tint} opacity="0.28" />}
    </svg>
  );
}

function ScreenshotThumb() {
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} style={{ display: "block" }}>
      <rect width="48" height="48" fill="#0f1722" />
      <rect x="13" y="8" width="22" height="32" rx="3" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      <rect x="16" y="13" width="16" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="16" y="18" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.3)" />
      <rect x="16" y="22" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.3)" />
      <rect x="16" y="28" width="16" height="6" rx="1" fill="rgba(77,144,254,0.45)" />
    </svg>
  );
}

function VideoThumb({ color = "#fb923c", duration }: { color?: string; duration: string }) {
  return (
    <div style={{ position: "relative", width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg, ${color}, #1a1410)` }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2 L12 7 L3 12 Z" fill="#fff" /></svg>
      </div>
      <span style={{
        position: "absolute", right: 3, bottom: 3,
        background: "rgba(0,0,0,0.6)", color: "#fff",
        fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 9, fontWeight: 700,
        padding: "1px 4px", borderRadius: 3, letterSpacing: "-0.01em",
      }}>{duration}</span>
    </div>
  );
}

function DocThumb({ ext, color }: { ext: string; color: string }) {
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} style={{ display: "block" }}>
      <rect width="48" height="48" fill="#12161e" />
      <rect x="10" y="7" width="22" height="30" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <path d="M28 7 L34 13 L28 13 Z" fill="rgba(255,255,255,0.12)" />
      <rect x="13" y="28" width="16" height="6" rx="1.5" fill={color} />
      <text x="21" y="32.6" fontFamily="Inter, sans-serif" fontSize="4.6" fontWeight="800" fill="#fff" textAnchor="middle" letterSpacing="0.04em">{ext.toUpperCase()}</text>
    </svg>
  );
}

// ---------- Categories with file objects ----------
type CleanFile = {
  name: string;
  size: string; // human
  bytes: number; // for math (in MB)
  thumb: JSX.Element;
  pairId?: number; // for duplicate visual grouping
};

const DUP_FILES: CleanFile[] = [
  { name: "IMG_2341.jpg", size: "3.2 MB", bytes: 3.2, thumb: <MountainThumb />, pairId: 1 },
  { name: "IMG_2341 (1).jpg", size: "3.2 MB", bytes: 3.2, thumb: <MountainThumb tint="#fb923c" />, pairId: 1 },
  { name: "Beach_2024.png", size: "2.8 MB", bytes: 2.8, thumb: <SunsetThumb />, pairId: 2 },
  { name: "Beach_2024 (copy).png", size: "2.8 MB", bytes: 2.8, thumb: <SunsetThumb tint="#ec4899" />, pairId: 2 },
];

const VID_FILES: CleanFile[] = [
  { name: "Vacation.mp4", size: "1.8 GB", bytes: 1800, thumb: <VideoThumb duration="8:42" color="#fb923c" /> },
  { name: "Wedding.mov", size: "1.2 GB", bytes: 1200, thumb: <VideoThumb duration="14:05" color="#a855f7" /> },
  { name: "Trip.mp4", size: "800 MB", bytes: 800, thumb: <VideoThumb duration="3:21" color="#14b8a6" /> },
];

const OLD_FILES: CleanFile[] = [
  { name: "TaxReturn_2022.pdf", size: "820 KB", bytes: 0.82, thumb: <DocThumb ext="pdf" color="#ef4444" /> },
  { name: "Old_Resume.docx", size: "120 KB", bytes: 0.12, thumb: <DocThumb ext="doc" color="#4d90fe" /> },
  { name: "Archive_2021.zip", size: "1.1 GB", bytes: 1100, thumb: <DocThumb ext="zip" color="#facc15" /> },
];

const SS_FILES: CleanFile[] = [
  { name: "Screenshot 2025-03-12.png", size: "420 KB", bytes: 0.42, thumb: <ScreenshotThumb /> },
  { name: "Screenshot 2025-03-13.png", size: "380 KB", bytes: 0.38, thumb: <ScreenshotThumb /> },
  { name: "Screenshot 2025-03-14.png", size: "510 KB", bytes: 0.51, thumb: <ScreenshotThumb /> },
];

const CATS = [
  { id: "dup", t: "Duplicate Photos", n: "1,247 files", s: "7.4 GB", I: DuplicateIcon, files: DUP_FILES, isDup: true },
  { id: "vid", t: "Large Videos", n: "18 files", s: "4.6 GB", I: VideoIcon, files: VID_FILES, isDup: false },
  { id: "old", t: "Old Files (not opened > 1 year)", n: "326 files", s: "2.1 GB", I: ClockIcon, files: OLD_FILES, isDup: false },
  { id: "ss", t: "Screenshots", n: "892 files", s: "1.2 GB", I: ScreenshotIcon, files: SS_FILES, isDup: false },
];

function fileKey(catId: string, name: string) { return `${catId}::${name}`; }

function fmtGB(mb: number) {
  const gb = mb / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function FishGlyph({ size = 14, color = "#4d90fe" }: { size?: number; color?: string }) {
  const w = size;
  const h = Math.round(size * (12 / 18));
  return (
    <svg width={w} height={h} viewBox="0 0 18 12" fill="none" aria-hidden>
      <path d="M2 6 C2 3 5 1.5 8.5 1.5 C12 1.5 14 3.5 14.5 6 C14 8.5 12 10.5 8.5 10.5 C5 10.5 2 9 2 6 Z" fill={color} />
      <path d="M14.5 6 L17.5 3 L17.5 9 Z" fill={color} />
      <circle cx="6" cy="5.2" r="0.6" fill="#0b1020" />
    </svg>
  );
}

function TrashAnimation() {
  return (
    <div className="trash-anim-wrap" aria-hidden>
      <div className="trash-anim">
        <svg width={48} height={56} viewBox="0 0 48 56" fill="none">
          <g className="trash-lid" style={{ transformOrigin: "24px 12px" }}>
            <path d="M6 12 H42" stroke="#4d90fe" strokeWidth={1.5} strokeLinecap="round" />
            <path d="M19 8 H29 V12 H19 Z" stroke="#4d90fe" strokeWidth={1.5} strokeLinejoin="round" fill="none" />
          </g>
          <path d="M9 14 L11 52 H37 L39 14" stroke="#4d90fe" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <path d="M18 22 V44 M24 22 V44 M30 22 V44" stroke="#4d90fe" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
        {[14, 12, 10].map((sz, i) => (
          <span key={i} className={`falling-fish ff-${i}`}>
            <FishGlyph size={sz} />
          </span>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`burst-dot bd-${i}`} />
        ))}
      </div>
    </div>
  );
}

function CircleCheck({ checked, onClick }: { checked: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        height: 22, width: 22, borderRadius: 999, flexShrink: 0,
        border: checked ? "none" : "2px solid rgba(255,255,255,0.4)",
        background: checked ? "#4d90fe" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        transition: "background 150ms ease",
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function CleanScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // All files start checked
  const allKeys = useMemo(() => {
    const s = new Set<string>();
    for (const c of CATS) for (const f of c.files) s.add(fileKey(c.id, f.name));
    return s;
  }, []);
  const [checked, setChecked] = useState<Set<string>>(allKeys);

  const toggleFile = (catId: string, name: string) => {
    const k = fileKey(catId, name);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const selectAllInCat = (catId: string) => {
    const cat = CATS.find((c) => c.id === catId)!;
    setChecked((prev) => {
      const next = new Set(prev);
      for (const f of cat.files) next.add(fileKey(catId, f.name));
      return next;
    });
  };

  const totalSelectedMB = useMemo(() => {
    let mb = 0;
    for (const c of CATS) for (const f of c.files) {
      if (checked.has(fileKey(c.id, f.name))) mb += f.bytes;
    }
    return mb;
  }, [checked]);

  const totalSelectedCount = checked.size;

  const startClean = () => {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      return;
    }
    setCleaning(true);
    window.setTimeout(() => {
      setCleaning(false);
      setDone(true);
    }, 1300);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mb-4 animate-pulse"
          style={{ background: "#4d90fe" }}
        >
          <Check size={32} strokeWidth={1.5} className="text-white" />
        </div>
        <h2 className="text-2xl font-semibold">All cleaned up!</h2>
        <p className="text-muted mt-2">Freed 12.3 GB across your clouds.</p>
        <button onClick={() => setDone(false)} className="mt-6 px-5 py-2.5 rounded-lg border border-border text-sm">Done</button>
      </div>
    );
  }

  const allSelected = totalSelectedCount === allKeys.size;
  const cleanLabel = allSelected ? `Clean All · 12.3 GB` : `Clean Selected · ${fmtGB(totalSelectedMB)}`;

  return (
    <div className="space-y-5">
      <SectionTitle>Smart Clean</SectionTitle>

      {/* Top banner */}
      <div
        className="flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, rgba(8,12,28,0.95) 0%, rgba(12,16,36,0.95) 100%)",
          border: "1px solid rgba(77,144,254,0.15)",
          borderRadius: 16,
          padding: "28px 32px",
        }}
      >
        <div className="shrink-0">
          <DecreasingLinesIcon size={36} color="#4d90fe" widths={[32, 22, 14]} gap={7} thickness={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 26, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            12.3 GB to reclaim
          </div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Across all your connected accounts
          </div>
        </div>
        <span
          className="shrink-0"
          style={{
            fontFamily: '"Inter Tight", "Inter", sans-serif',
            fontSize: 11,
            color: "#4d90fe",
            background: "rgba(77,144,254,0.10)",
            border: "1px solid rgba(77,144,254,0.2)",
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          4 categories
        </span>
      </div>

      <div className="space-y-2 relative">
        {CATS.map((cat, idx) => {
          const I = cat.I;
          const isOpen = open === cat.id;
          return (
            <div
              key={cat.id}
              className={`overflow-hidden clean-row relative ${cleaning ? "row-sweep" : ""}`}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: 12,
                transition: "background 150ms ease",
                animationDelay: cleaning ? `${idx * 80}ms` : undefined,
              }}
            >
              <div className="flex items-center gap-4" style={{ padding: "18px 20px" }}>
                <div className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
                  <I />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.9)" }}>{cat.t}</div>
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.35)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                    {cat.n} • {cat.s}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(isOpen ? null : cat.id)}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                >
                  Review
                  <ChevronDown size={18} strokeWidth={1.5} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              {cleaning && (
                <span className="row-fish" style={{ animationDelay: `${idx * 80}ms` }}>
                  <FishGlyph size={18} />
                </span>
              )}
              {isOpen && !cleaning && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: 12 }}>
                  {cat.files.map((f, i) => {
                    const k = fileKey(cat.id, f.name);
                    const isChecked = checked.has(k);
                    const prevPair = i > 0 ? cat.files[i - 1].pairId : undefined;
                    const showPairLabel = cat.isDup && f.pairId && f.pairId !== prevPair;
                    const pairBg = cat.isDup && f.pairId
                      ? (f.pairId % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent")
                      : "transparent";
                    return (
                      <div key={f.name}>
                        {showPairLabel && (
                          <div style={{
                            fontFamily: '"Inter", sans-serif', fontSize: 9, fontWeight: 500,
                            color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
                            letterSpacing: "0.08em", padding: "6px 8px 4px",
                          }}>
                            duplicate pair
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "8px 10px", borderRadius: 8,
                            background: pairBg,
                          }}
                        >
                          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                            {f.thumb}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {f.name}
                            </div>
                            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                              {f.size}
                            </div>
                          </div>
                          <CircleCheck checked={isChecked} onClick={(e) => { e.stopPropagation(); toggleFile(cat.id, f.name); }} />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => selectAllInCat(cat.id)}
                    style={{
                      marginTop: 10, width: "100%",
                      background: "rgba(77,144,254,0.1)",
                      border: "1px solid rgba(77,144,254,0.2)",
                      borderRadius: 8, padding: "8px 16px",
                      fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600,
                      color: "#4d90fe", cursor: "pointer",
                    }}
                  >
                    {cat.isDup ? "Select All Duplicates" : "Select All"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {cleaning && <TrashAnimation />}
      </div>

      <button
        onClick={startClean}
        disabled={cleaning || totalSelectedCount === 0}
        className="w-full text-white clean-all-btn"
        style={{
          background: "#4d90fe",
          borderRadius: 12,
          height: 52,
          fontFamily: '"Inter", sans-serif',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "0 0 32px rgba(77,144,254,0.30)",
          transition: "background 200ms ease, box-shadow 200ms ease",
          opacity: totalSelectedCount === 0 ? 0.5 : 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {cleanLabel}
      </button>
    </div>
  );
}
