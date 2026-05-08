import { Home, Images, FolderOpen, Cloud, BarChart3, Sparkles, Settings2, Upload } from "lucide-react";
import type { ReactNode } from "react";

function MascotFish() {
  return (
    <div className="mascot-fish" aria-hidden>
      <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
        <defs>
          <linearGradient id="fishBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4d90fe" />
            <stop offset="100%" stopColor="#8ab4ff" />
          </linearGradient>
        </defs>
        <ellipse cx="14" cy="12" rx="12" ry="7" fill="url(#fishBody)" />
        <path d="M26 12 L34 6 L31 12 L34 18 Z" fill="url(#fishBody)" />
        <circle cx="20" cy="10" r="1.6" fill="#ffffff" />
        <circle cx="20.4" cy="10" r="0.6" fill="#060810" />
      </svg>
      <span className="mascot-shadow" />
    </div>
  );
}

export type ScreenId = "home" | "gallery" | "files" | "clouds" | "upload" | "analytics" | "clean" | "settings";

const NAV: { id: ScreenId; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "clouds", label: "Clouds", icon: Cloud },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "clean", label: "Smart Clean", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings2 },
];

function FishIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 10 C3 6.5, 7 4, 11 4 C14.5 4, 17 6.5, 17 10 C17 13.5, 14.5 16, 11 16 C7 16, 3 13.5, 3 10 Z"
        fill="#4d90fe"
      />
      <path d="M16 10 L20 6 L20 14 Z" fill="#4d90fe" />
      <circle cx="13" cy="9" r="1" fill="#060810" />
    </svg>
  );
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-display" style={{ fontSize: size, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.015em" }}>
      <FishIcon size={size} />
      <span><span style={{ color: "#ffffff" }}>Vault</span><span style={{ color: "#4d90fe" }}>Fish</span></span>
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
  return (
    <div className="min-h-screen flex bg-background text-foreground app-bg">
      <div aria-hidden className="mesh-layer mesh-1" />
      <div aria-hidden className="mesh-layer mesh-2" />
      <div aria-hidden className="mesh-layer mesh-3" />
      <div aria-hidden className="mesh-layer mesh-4" />

      <aside className="hidden md:flex w-64 shrink-0 flex-col p-4 sticky top-0 h-screen sidebar-surface z-10 relative">
        <div className="logo-glow flex items-center px-2 py-3 mb-4">
          <Logo size={22} />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = current === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  onNavigate(n.id);
                  const el = document.querySelector(".mascot-fish");
                  if (el) {
                    el.classList.remove("jumping");
                    void (el as HTMLElement).offsetWidth;
                    el.classList.add("jumping");
                    setTimeout(() => el.classList.remove("jumping"), 500);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display transition-colors ${
                  active
                    ? "nav-active"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
                style={active ? { paddingLeft: "calc(0.75rem - 2px)", fontWeight: 700 } : { fontWeight: 600 }}
              >
                <Icon size={18} strokeWidth={1.5} />
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
        {NAV.filter(n => ["home","gallery","files","analytics","settings"].includes(n.id)).map((n) => {
          const Icon = n.icon;
          const active = current === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className="relative flex items-center justify-center"
            >
              <span
                className="flex items-center gap-1.5 transition-all"
                style={{
                  color: active ? "#4d90fe" : "#6b7280",
                  background: active ? "rgba(77,144,254,0.12)" : "transparent",
                  borderRadius: 999,
                  padding: active ? "6px 14px" : "6px 10px",
                }}
              >
                <Icon size={20} strokeWidth={1.75} />
                {active && (
                  <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {n.label}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
