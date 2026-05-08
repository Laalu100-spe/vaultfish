import { Card } from "../ui";
import { ArrowUpFromLine, ScanLine, GitMerge, LayoutDashboard, Sparkles, Copy, FileVideo, ChevronRight } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";

const PROVIDER_GRADIENTS: Record<string, string> = {
  "Google Drive": "#4d90fe",
  "Dropbox": "#f472b6",
  "OneDrive": "#2dd4bf",
};

const PROVIDER_COLOR: Record<string, string> = {
  "Google Drive": "#4d90fe",
  "Dropbox": "#f472b6",
  "OneDrive": "#2dd4bf",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-label" style={{ marginBottom: 12 }}>{children}</h2>;
}

export function HomeScreen({ onNav }: { onNav: (s: any) => void }) {
  const accounts = [
    { name: "Google Drive", used: 42, total: 100 },
    { name: "Dropbox", used: 22, total: 25 },
    { name: "OneDrive", used: 18, total: 25 },
  ];

  const quickActions = [
    { i: ArrowUpFromLine, l: "Upload", to: "upload", color: "#4d90fe", bg: "rgba(77,144,254,0.12)" },
    { i: ScanLine, l: "Scan Files", to: "files", color: "#a78bfa", bg: "rgba(139,92,246,0.12)" },
    { i: GitMerge, l: "Clean Duplicates", to: "clean", color: "#f87171", bg: "rgba(239,68,68,0.12)" },
    { i: LayoutDashboard, l: "Smart Organize", to: "clean", color: "#2dd4bf", bg: "rgba(20,184,166,0.12)" },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>VaultFish</h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", marginTop: 4 }}>Across all your connected clouds</p>
      </div>

      {/* Total storage card */}
      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top left, rgba(77,144,254,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative" style={{ padding: "22px 24px" }}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="section-label">Total Storage</div>
              <div className="mt-2 flex items-baseline gap-2 leading-none">
                <span style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 72, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>82</span>
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.02em", lineHeight: 1 }}>GB</span>
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.25)", letterSpacing: "-0.01em" }}>/ 150 GB used</span>
              </div>
            </div>
            <div style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>55%</div>
          </div>
          <StorageBar pct={55} fill="linear-gradient(90deg, #a78bfa, #4d90fe, #2dd4bf)" dotColor="#2dd4bf" />
          <div className="mt-5 space-y-3.5">
            {accounts.map(a => {
              const pct = Math.round((a.used/a.total)*100);
              return (
                <div key={a.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="flex items-center gap-2">
                      <PlatformIcon name={a.name} size={16} />
                      <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", color: PLATFORM_COLORS[a.name] }}>{a.name}</span>
                    </span>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.5)" }}>{a.used} GB / {a.total} GB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <StorageBar pct={pct} fill={PROVIDER_GRADIENTS[a.name]} dotColor={PROVIDER_COLOR[a.name]} />
                    </div>
                    <span className="w-10 text-right" style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: PROVIDER_COLOR[a.name] }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Smart Clean banner */}
      <div
        className="flex items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(77,144,254,0.15) 0%, rgba(124,58,237,0.10) 100%)",
          border: "1px solid rgba(77,144,254,0.25)",
          borderRadius: 16,
          padding: "18px 20px",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center shrink-0" style={{ background: "rgba(77,144,254,0.18)", height: 40, width: 40, borderRadius: 10 }}>
            <Sparkles size={18} strokeWidth={1.5} style={{ color: "#4d90fe" }} />
          </div>
          <div className="min-w-0">
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.9)" }}>
              You can free up <span style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>12 GB</span> instantly
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.35)" }}>
              Duplicates, old files, and large videos detected
            </div>
          </div>
        </div>
        <button
          onClick={() => onNav("clean")}
          className="shrink-0 text-white"
          style={{ background: "#4d90fe", borderRadius: 10, padding: "10px 16px", fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: "0.01em" }}
        >
          Smart Clean
        </button>
      </div>

      <div>
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => {
            const I = a.i;
            return (
              <button
                key={a.l}
                onClick={() => onNav(a.to)}
                className="flex flex-col items-center gap-3 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: 20,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(77,144,254,0.08)";
                  e.currentTarget.style.borderColor = "rgba(77,144,254,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div className="flex items-center justify-center" style={{ background: a.bg, height: 44, width: 44, borderRadius: 999 }}>
                  <I size={18} strokeWidth={1.5} style={{ color: a.color }} />
                </div>
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.7)" }}>{a.l}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Smart Insights</SectionLabel>
        <div className="space-y-2.5">
          {[
            { i: Copy, t: "Duplicate photos found", s: "You have 1,247 duplicates", v: "7.4 GB", c: "#a78bfa" },
            { i: FileVideo, t: "Large videos taking space", s: "Review and clean", v: "4.6 GB", c: "#fb923c" },
          ].map(x => {
            const I = x.i;
            return (
              <button
                key={x.t}
                onClick={() => onNav("clean")}
                className="insight-card w-full text-left flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${x.c}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div className="flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklab, ${x.c} 18%, transparent)`, height: 40, width: 40, borderRadius: 10 }}>
                  <I size={18} strokeWidth={1.5} style={{ color: x.c }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.9)" }}>{x.t}</div>
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.35)" }}>{x.s}</div>
                </div>
                <span
                  style={{
                    fontFamily: '"Inter Tight", "Inter", sans-serif',
                    fontVariantNumeric: "tabular-nums",
                    background: `color-mix(in oklab, ${x.c} 18%, transparent)`,
                    color: "#ffffff",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {x.v}
                </span>
                <ChevronRight size={18} strokeWidth={1.5} style={{ color: "#374151" }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StorageBar({ pct, fill, dotColor }: { pct: number; fill: string; dotColor: string }) {
  return (
    <div className="relative w-full" style={{ background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 999 }}>
      <div
        className="bar-fill relative"
        style={{ width: `${Math.min(100, pct)}%`, height: 4, background: fill, borderRadius: 999 }}
      >
        <span
          aria-hidden
          className="absolute"
          style={{
            right: -2,
            top: "50%",
            transform: "translateY(-50%)",
            height: 4,
            width: 4,
            borderRadius: 999,
            background: dotColor,
            boxShadow: `0 0 6px 2px color-mix(in oklab, ${dotColor} 60%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
