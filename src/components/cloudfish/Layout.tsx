import {
  House,
  GalleryHorizontalEnd,
  Files,
  Layers,
  ArrowUpFromLine,
  TrendingUp,
  SlidersHorizontal,
  MessageCircle,
  Grid3x3,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { DecreasingLinesIcon } from "./PlatformIcons";
import { VaultFishMark } from "./VaultFishMark";

function SmartCleanIcon({ size = 18, style }: { size?: number; strokeWidth?: number; style?: React.CSSProperties }) {
  const color = (style?.color as string) || "#6b7280";
  return <DecreasingLinesIcon size={size} color={color} widths={[size, size * 0.7, size * 0.42]} gap={size * 0.22} thickness={1.5} />;
}

function MascotFish() {
  return (
    <div className="mascot-fish" aria-hidden>
      <svg width="44" height="28" viewBox="0 0 44 28" fill="none">
        <defs>
          <linearGradient id="vfFishBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4d90fe" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="vfFishBelly" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <ellipse cx="17" cy="14" rx="15" ry="8.5" fill="url(#vfFishBody)" />
        <ellipse cx="17" cy="15.5" rx="11" ry="2.2" fill="url(#vfFishBelly)" />
        <path d="M30 14 C34 10, 38 8, 42 6 C40 10, 40 18, 42 22 C38 20, 34 18, 30 14 Z" fill="url(#vfFishBody)" />
        <path d="M16 16 C14 19, 12 20, 10 20 C11 18, 12 17, 14 15.5 Z" fill="url(#vfFishBody)" opacity="0.85" />
        <circle cx="22" cy="12" r="1.8" fill="#ffffff" />
        <circle cx="22.3" cy="12" r="0.9" fill="#0b1020" />
      </svg>
    </div>
  );
}

export type ScreenId = "home" | "gallery" | "files" | "whatsapp" | "clouds" | "upload" | "analytics" | "clean" | "settings";

const NAV: { id: ScreenId; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontalEnd },
  { id: "files", label: "Files", icon: Files },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "clouds", label: "Clouds", icon: Layers },
  { id: "upload", label: "Upload", icon: ArrowUpFromLine },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "clean", label: "Smart Clean", icon: SmartCleanIcon },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

function Logo({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center vf-logo"
      style={{ fontFamily: '"Inter", sans-serif', fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", gap: 8 }}
    >
      <VaultFishMark size={28} />
      <span style={{ display: "inline-flex", alignItems: "baseline" }}>
        <span className="vf-logo-vault" style={{ fontWeight: 300 }}>Vault</span>
        <span style={{ fontWeight: 800, color: "#4d90fe" }}>Fish</span>
      </span>
    </div>
  );
}

const MOBILE_MAIN: ScreenId[] = ["home", "gallery", "files", "whatsapp", "settings"];
const MOBILE_MORE: ScreenId[] = ["clouds", "upload", "analytics", "clean"];

export function Layout({
  current,
  onNavigate,
  children,
}: {
  current: ScreenId;
  onNavigate: (id: ScreenId) => void;
  children: ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const mainItems = NAV.filter((n) => MOBILE_MAIN.includes(n.id));
  const moreItems = NAV.filter((n) => MOBILE_MORE.includes(n.id));

  return (
    <div className="min-h-screen bg-background text-foreground app-bg">
      <div aria-hidden className="mesh-layer mesh-1" />
      <div aria-hidden className="mesh-layer mesh-2" />
      <div aria-hidden className="mesh-layer mesh-3" />
      <div aria-hidden className="mesh-layer mesh-4" />

      <aside
        className="hidden md:flex flex-col p-4 sidebar-surface"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 240,
          overflowY: "auto",
          zIndex: 50,
        }}
      >
        <div className="logo-glow flex items-center px-2 py-3 mb-4">
          <Logo size={20} />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = current === n.id;
            return (
              <button
                key={n.id}
                onClick={() => onNavigate(n.id)}
                className={`vf-sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? "vf-sidebar-item-active" : ""}`}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  letterSpacing: "-0.01em",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={18} strokeWidth={1.5} className="vf-sidebar-glyph" style={{ color: active ? "var(--accent-blue)" : "var(--muted)" }} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <MascotFish />
        <div className="mt-auto text-xs text-muted px-2">Swim across all your clouds.</div>
      </aside>

      <main
        className="min-w-0 md:pb-8 relative z-10"
        style={{
          marginLeft: 0,
          paddingBottom: "calc(76px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="vf-main-shift">
          <div
            className="md:hidden sticky top-0 z-20 px-4 py-3 flex items-center vf-mobile-topbar"
            style={{
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
          >
            <Logo size={20} />
          </div>
          <div className="max-w-6xl mx-auto" style={{ padding: "20px" }}>{children}</div>
        </div>
      </main>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-6 vf-mobile-bottomnav"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          height: 68,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {mainItems.map((n) => {
          const Icon = n.icon;
          const active = current === n.id;
          return (
            <button
              key={n.id}
              onClick={() => { onNavigate(n.id); setMoreOpen(false); }}
              className="relative flex flex-col items-center justify-center"
              style={{ gap: 3 }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--accent-blue)",
                  }}
                />
              )}
              <Icon size={20} strokeWidth={1.5} style={{ color: active ? "var(--accent-blue)" : "var(--nav-inactive, rgba(255,255,255,0.35))" }} />
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: active ? "var(--accent-blue)" : "var(--nav-inactive, rgba(255,255,255,0.35))",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                {n.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className="relative flex flex-col items-center justify-center"
          style={{ gap: 3 }}
        >
          <Grid3x3 size={20} strokeWidth={1.5} style={{ color: moreOpen ? "var(--accent-blue)" : "var(--nav-inactive, rgba(255,255,255,0.35))" }} />
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 9,
              fontWeight: 500,
              color: moreOpen ? "var(--accent-blue)" : "var(--nav-inactive, rgba(255,255,255,0.35))",
              lineHeight: 1,
            }}
          >
            More
          </span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            className="md:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
          />
          <div
            className="md:hidden fixed inset-x-0 z-50 vf-more-sheet"
            style={{
              bottom: "calc(68px + env(safe-area-inset-bottom))",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "16px 16px 20px",
            }}
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>More</div>
              <button onClick={() => setMoreOpen(false)} style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map((n) => {
                const Icon = n.icon;
                const active = current === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => { onNavigate(n.id); setMoreOpen(false); }}
                    className="flex flex-col items-center justify-center vf-more-item"
                    style={{
                      padding: "14px 6px",
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <Icon size={22} strokeWidth={1.5} style={{ color: active ? "var(--accent-blue)" : "var(--foreground)" }} />
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, fontWeight: 500, color: active ? "var(--accent-blue)" : "var(--foreground)" }}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
