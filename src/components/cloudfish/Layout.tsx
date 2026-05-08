import {
  House,
  GalleryHorizontalEnd,
  Files,
  Layers,
  ArrowUpFromLine,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import { DecreasingLinesIcon } from "./PlatformIcons";

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
        {/* Body */}
        <ellipse cx="17" cy="14" rx="15" ry="8.5" fill="url(#vfFishBody)" />
        {/* Belly streak */}
        <ellipse cx="17" cy="15.5" rx="11" ry="2.2" fill="url(#vfFishBelly)" />
        {/* Tail — two curved fins */}
        <path d="M30 14 C34 10, 38 8, 42 6 C40 10, 40 18, 42 22 C38 20, 34 18, 30 14 Z" fill="url(#vfFishBody)" />
        {/* Pectoral fin */}
        <path d="M16 16 C14 19, 12 20, 10 20 C11 18, 12 17, 14 15.5 Z" fill="url(#vfFishBody)" opacity="0.85" />
        {/* Eye */}
        <circle cx="22" cy="12" r="1.8" fill="#ffffff" />
        <circle cx="22.3" cy="12" r="0.9" fill="#0b1020" />
      </svg>
    </div>
  );
}

export type ScreenId = "home" | "gallery" | "files" | "clouds" | "upload" | "analytics" | "clean" | "settings";

const NAV: { id: ScreenId; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontalEnd },
  { id: "files", label: "Files", icon: Files },
  { id: "clouds", label: "Clouds", icon: Layers },
  { id: "upload", label: "Upload", icon: ArrowUpFromLine },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "clean", label: "Smart Clean", icon: SmartCleanIcon },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

function Logo({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center"
      style={{ fontFamily: '"Inter", sans-serif', fontSize: size, lineHeight: 1, letterSpacing: "-0.03em" }}
    >
      <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.85)" }}>Vault</span>
      <span style={{ fontWeight: 800, color: "#4d90fe" }}>Fish</span>
    </div>
  );
}

export function Layout({
  current,
  onNavigate,
  children,
}: {
  current: ScreenId;
  onNavigate: (id: ScreenId) => void;
  children: ReactNode;
}) {
  const mobileNav = NAV.filter((n) => ["home", "gallery", "files", "analytics", "settings"].includes(n.id));

  return (
    <div className="min-h-screen flex bg-background text-foreground app-bg">
      <div aria-hidden className="mesh-layer mesh-1" />
      <div aria-hidden className="mesh-layer mesh-2" />
      <div aria-hidden className="mesh-layer mesh-3" />
      <div aria-hidden className="mesh-layer mesh-4" />

      <aside className="hidden md:flex w-64 shrink-0 flex-col p-4 sticky top-0 h-screen sidebar-surface z-10 relative">
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  letterSpacing: "-0.01em",
                  background: active ? "rgba(77,144,254,0.10)" : "transparent",
                  color: active ? "#4d90fe" : "#6b7280",
                  fontWeight: active ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "#6b7280";
                }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color: active ? "#4d90fe" : "#6b7280" }} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <MascotFish />
        <div className="mt-auto text-xs text-muted px-2">Swim across all your clouds.</div>
      </aside>

      <main className="flex-1 min-w-0 pb-24 md:pb-8 relative z-10">
        <div
          className="md:hidden sticky top-0 z-20 px-4 py-3 flex items-center"
          style={{
            background: "rgba(8,9,14,0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Logo size={20} />
        </div>
        <div className="max-w-6xl mx-auto" style={{ padding: "20px" }}>{children}</div>
      </main>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5"
        style={{
          background: "rgba(8,9,14,0.90)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          height: 64,
        }}
      >
        {mobileNav.map((n) => {
          const Icon = n.icon;
          const active = current === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className="relative flex flex-col items-center justify-center gap-1"
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: active ? "rgba(77,144,254,0.15)" : "transparent",
                }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color: active ? "#4d90fe" : "#6b7280" }} />
              </span>
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: active ? "#4d90fe" : "#6b7280",
                }}
              >
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
