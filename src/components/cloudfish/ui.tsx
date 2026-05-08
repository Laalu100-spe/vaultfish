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

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-[color:var(--accent-blue)]" : "bg-[color:var(--border)]"}`}
    >
      <span className={`absolute top-0.5 ${on ? "left-5" : "left-0.5"} h-5 w-5 rounded-full bg-white transition-all`} />
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
