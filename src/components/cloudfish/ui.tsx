import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl card-hover ${className}`}>{children}</div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.95)" }}>{children}</h1>
      {sub && <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export function Bar({
  pct,
  color = "",
  height = "h-1.5",
  fill,
}: {
  pct: number;
  color?: string;
  height?: string;
  fill?: string;
}) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", height: 6 }}>
      <div
        className={`rounded-full bar-fill ${color}`}
        style={{ width: `${Math.min(100, pct)}%`, height: 6, background: fill || "#4d90fe" }}
      />
    </div>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      style={{
        position: "relative",
        height: 24,
        width: 42,
        borderRadius: 999,
        background: on ? "#4d90fe" : "rgba(255,255,255,0.1)",
        transition: "background 200ms ease",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          height: 20,
          width: 20,
          borderRadius: 999,
          background: "#fff",
          transition: "left 200ms ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

export function Pill({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
        active
          ? "bg-[color:var(--accent-blue)] text-white border-transparent"
          : "bg-card text-muted border-border hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
