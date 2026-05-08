import { Card } from "../ui";
import { ArrowUpFromLine, ScanLine, GitMerge, LayoutDashboard, Sparkles, Copy, FileVideo, ChevronRight } from "lucide-react";

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
  return (
    <h2
      className="font-mono-num"
      style={{ fontSize: 10, letterSpacing: "0.15em", color: "#374151", textTransform: "uppercase", marginBottom: 12, fontWeight: 500 }}
    >
      {children}
    </h2>
  );
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
        <h1 className="font-display tracking-tight" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>VaultFish</h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "#6b7280", marginTop: 4 }}>Across all your connected clouds</p>
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
              <div className="font-mono-num" style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4b5563", textTransform: "uppercase" }}>Total Storage</div>
              <div className="mt-2 flex items-baseline gap-2 leading-none">
                <span className="font-display" style={{ fontSize: 64, fontWeight: 800, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.03em" }}>82</span>
                <span className="font-display" style={{ fontSize: 24, fontWeight: 400, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>GB</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.3)" }}>/ 150 GB used</span>
              </div>
            </div>
            <div className="text-xs font-mono-num" style={{ color: "rgba(255,255,255,0.4)" }}>55%</div>
          </div>
          <StorageBar pct={55} fill="linear-gradient(90deg, #a78bfa, #4d90fe, #2dd4bf)" dotColor="#2dd4bf" />
          <div className="mt-5 space-y-3.5">
            {accounts.map(a => {
              const pct = Math.round((a.used/a.total)*100);
              return (
                <div key={a.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR[a.name] }} />
                      <span className="font-display" style={{ fontWeight: 600 }}>{a.name}</span>
                    </span>
                    <span className="text-muted font-mono-num">{a.used} GB / {a.total} GB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <StorageBar pct={pct} fill={PROVIDER_GRADIENTS[a.name]} dotColor={PROVIDER_COLOR[a.name]} />
                    </div>
                    <span className="text-xs font-mono-num w-10 text-right" style={{ color: PROVIDER_COLOR[a.name] }}>{pct}%</span>
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
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,144,254,0.18)" }}>
            <Sparkles size={18} strokeWidth={1.75} style={{ color: "#4d90fe" }} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-white" style={{ fontSize: 15, fontWeight: 700 }}>
              You can free up <span className="font-mono-num">12 GB</span> instantly
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: "#6b7280" }}>
              Duplicates, old files, and large videos detected
            </div>
          </div>
        </div>
        <button
          onClick={() => onNav("clean")}
          className="shrink-0 text-white"
          style={{ background: "#4d90fe", borderRadius: 10, padding: "10px 16px", fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, fontWeight: 600 }}
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
                <div className="rounded-full flex items-center justify-center" style={{ background: a.bg, height: 44, width: 44 }}>
                  <I size={20} strokeWidth={1.75} style={{ color: a.color }} />
                </div>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: "#9ca3af" }}>{a.l}</span>
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
                <div className="rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklab, ${x.c} 18%, transparent)`, height: 40, width: 40 }}>
                  <I size={18} strokeWidth={1.75} style={{ color: x.c }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-white" style={{ fontSize: 14 }}>{x.t}</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: "#6b7280" }}>{x.s}</div>
                </div>
                <span
                  className="font-mono-num"
                  style={{
                    background: `color-mix(in oklab, ${x.c} 18%, transparent)`,
                    color: x.c,
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontWeight: 500,
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
