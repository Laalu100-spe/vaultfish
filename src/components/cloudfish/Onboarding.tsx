import { useEffect, useRef, useState } from "react";

type Provider = "Google Drive" | "Dropbox" | "OneDrive";

function MeshBg() {
  return (
    <>
      <div aria-hidden className="mesh-layer mesh-1" />
      <div aria-hidden className="mesh-layer mesh-2" />
      <div aria-hidden className="mesh-layer mesh-3" />
      <div aria-hidden className="mesh-layer mesh-4" />
    </>
  );
}

function Dots({ step }: { step: 0 | 1 | 2 }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: i === step ? 22 : 6,
            height: 6,
            borderRadius: 999,
            background: i === step ? "#4d90fe" : "rgba(255,255,255,0.18)",
            transition: "all 250ms ease",
          }}
        />
      ))}
    </div>
  );
}

function FishMascot({ size = 64 }: { size?: number }) {
  const w = size;
  const h = (size * 28) / 44;
  return (
    <svg width={w} height={h} viewBox="0 0 44 28" fill="none" className="ob-float" aria-hidden>
      <defs>
        <linearGradient id="obFish" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4d90fe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <ellipse cx="17" cy="14" rx="15" ry="8.5" fill="url(#obFish)" />
      <path d="M30 14 C34 10, 38 8, 42 6 C40 10, 40 18, 42 22 C38 20, 34 18, 30 14 Z" fill="url(#obFish)" />
      <circle cx="22" cy="12" r="1.8" fill="#fff" />
      <circle cx="22.3" cy="12" r="0.9" fill="#0b1020" />
    </svg>
  );
}

function ProviderIcon({ name }: { name: Provider }) {
  if (name === "Google Drive") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M8 3h8l6 10-4 8H6L2 13 8 3z" stroke="#4d90fe" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "Dropbox") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M6 4l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 12l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4z" transform="translate(-3 0)" stroke="#60a5fa" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0118 18H7z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const PROVIDERS: { name: Provider; sub: string }[] = [
  { name: "Google Drive", sub: "Connect up to 5 accounts" },
  { name: "Dropbox", sub: "Connect up to 5 accounts" },
  { name: "OneDrive", sub: "Connect up to 5 accounts" },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [exiting, setExiting] = useState<0 | 1 | 2 | null>(null);
  const [connected, setConnected] = useState<Record<Provider, boolean>>({
    "Google Drive": false,
    Dropbox: false,
    OneDrive: false,
  });

  const go = (next: 0 | 1 | 2) => {
    setExiting(step);
    setTimeout(() => {
      setStep(next);
      setExiting(null);
    }, 350);
  };

  const finish = () => {
    try { localStorage.setItem("vaultfish_onboarded", "true"); } catch {}
    onDone();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0b1020",
        zIndex: 100,
        overflow: "hidden",
        color: "#fff",
        fontFamily: '"Inter", sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <MeshBg />
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        {[0, 1, 2].map((i) => {
          const isCurrent = step === i && exiting !== i;
          const isExiting = exiting === i;
          if (!isCurrent && !isExiting) return null;
          return (
            <div
              key={i}
              className={isExiting ? "ob-slide-out-left" : "ob-slide-in-right"}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                padding: "32px 24px",
                willChange: "transform, opacity",
              }}
            >
              {i === 0 && <ScreenWelcome onNext={() => go(1)} />}
              {i === 1 && (
                <ScreenConnect
                  connected={connected}
                  setConnected={setConnected}
                  onNext={() => go(2)}
                  onSkip={() => go(2)}
                />
              )}
              {i === 2 && <ScreenReady onDone={finish} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", zIndex: 110 }}>
        <Dots step={step} />
      </div>
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        maxWidth: 320,
        height: 52,
        borderRadius: 14,
        background: disabled ? "rgba(255,255,255,0.08)" : "#4d90fe",
        color: disabled ? "rgba(255,255,255,0.35)" : "#fff",
        fontFamily: '"Inter", sans-serif',
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 200ms ease",
      }}
    >
      {children}
    </button>
  );
}

function ScreenWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, paddingBottom: 80 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ display: "flex", lineHeight: 1, letterSpacing: "-0.04em", fontSize: 48 }}>
          <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>Vault</span>
          <span style={{ fontWeight: 800, color: "#4d90fe" }}>Fish</span>
        </div>
        <FishMascot size={64} />
        <p style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em", textAlign: "center" }}>
          Swim across all your clouds
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
        <PrimaryBtn onClick={onNext}>Get Started</PrimaryBtn>
        <button
          onClick={onNext}
          style={{ background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: '"Inter", sans-serif' }}
        >
          Already have an account? <span style={{ color: "rgba(255,255,255,0.6)" }}>Sign in</span>
        </button>
      </div>
    </div>
  );
}

function ScreenConnect({
  connected,
  setConnected,
  onNext,
  onSkip,
}: {
  connected: Record<Provider, boolean>;
  setConnected: (c: Record<Provider, boolean>) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const anyConnected = Object.values(connected).some(Boolean);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80, maxWidth: 480, margin: "0 auto", width: "100%", justifyContent: "center" }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>Connect your clouds</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "-0.01em" }}>
          Add your accounts and see everything in one place
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PROVIDERS.map((p) => {
          const isConnected = connected[p.name];
          return (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "16px 20px",
              }}
            >
              <ProviderIcon name={p.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{p.sub}</div>
              </div>
              <button
                onClick={() => setConnected({ ...connected, [p.name]: !isConnected })}
                style={{
                  background: isConnected ? "rgba(34,197,94,0.15)" : "rgba(77,144,254,0.15)",
                  border: `1px solid ${isConnected ? "rgba(34,197,94,0.4)" : "rgba(77,144,254,0.3)"}`,
                  color: isConnected ? "#4ade80" : "#4d90fe",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 200ms ease",
                }}
              >
                {isConnected ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Connected
                  </>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <PrimaryBtn onClick={onNext} disabled={!anyConnected}>
          Continue
        </PrimaryBtn>
        <button
          onClick={onSkip}
          style={{ background: "transparent", color: "rgba(255,255,255,0.25)", fontSize: 13, textDecoration: "underline", fontFamily: '"Inter", sans-serif' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function useCounter(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      setValue(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function ScreenReady({ onDone }: { onDone: () => void }) {
  const clouds = useCounter(3);
  const gb = useCounter(150);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, paddingBottom: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="40" stroke="#4d90fe" strokeWidth="3" fill="none" className="ob-check-circle" pathLength={251} />
        <path d="M24 41 L36 53 L57 30" stroke="#4d90fe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" className="ob-check-mark" pathLength={60} />
      </svg>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>You're all set</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "-0.01em" }}>
          VaultFish is ready to organize your clouds
        </p>
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { v: `${clouds}`, l: "Clouds" },
          { v: `${gb} GB`, l: "Storage" },
          { v: "∞", l: "Files" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
              {s.v}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <PrimaryBtn onClick={onDone}>Go to Dashboard</PrimaryBtn>
      </div>
    </div>
  );
}
