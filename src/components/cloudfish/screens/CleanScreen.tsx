import { useState } from "react";
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

const CATS = [
  { id: "dup", t: "Duplicate Photos", n: "1,247 files", s: "7.4 GB", I: DuplicateIcon, files: ["IMG_2341.jpg","IMG_2341 (1).jpg","Beach_2024.png","Beach_2024 (copy).png"] },
  { id: "vid", t: "Large Videos", n: "18 files", s: "4.6 GB", I: VideoIcon, files: ["Vacation.mp4 — 1.8 GB","Wedding.mov — 1.2 GB","Trip.mp4 — 800 MB"] },
  { id: "old", t: "Old Files (not opened > 1 year)", n: "326 files", s: "2.1 GB", I: ClockIcon, files: ["TaxReturn_2022.pdf","Old_Resume.docx","Archive_2021.zip"] },
  { id: "ss", t: "Screenshots", n: "892 files", s: "1.2 GB", I: ScreenshotIcon, files: ["Screenshot 2025-03-12.png","Screenshot 2025-03-13.png","Screenshot 2025-03-14.png"] },
];

export function CleanScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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

      <div className="space-y-2">
        {CATS.map(cat => {
          const I = cat.I;
          const isOpen = open === cat.id;
          return (
            <div
              key={cat.id}
              className="overflow-hidden clean-row"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: 12,
                transition: "background 150ms ease",
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
              {isOpen && (
                <div className="border-t border-border p-3 space-y-1.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {cat.files.map(f => (
                    <div key={f} className="text-xs px-3 py-2 bg-background rounded-lg flex justify-between">
                      <span>{f}</span>
                      <input type="checkbox" defaultChecked className="accent-[color:var(--accent-blue)]" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setDone(true)}
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
        }}
      >
        Clean All · 12.3 GB
      </button>
    </div>
  );
}
