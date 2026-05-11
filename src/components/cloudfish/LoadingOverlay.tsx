import { useEffect, useRef, useState } from "react";

function GoogleDriveTri() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <path d="M10 4 L4 22 L12 22 Z" fill="#4285f4" />
      <path d="M18 4 L24 22 L16 22 Z" fill="#34a853" />
      <path d="M10 4 L18 4 L14 12 Z" fill="#fbbc04" opacity="0.95" />
      <path d="M12 22 L16 22 L14 14 Z" fill="#fbbc04" />
    </svg>
  );
}

function DropboxDiamonds() {
  // 5 diamonds (rotated squares) in Dropbox-like arrangement
  const D = ({ x, y }: { x: number; y: number }) => (
    <rect x={x} y={y} width="6.5" height="6.5" fill="#0061fe" transform={`rotate(45 ${x + 3.25} ${y + 3.25})`} />
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <D x={3} y={5} />
      <D x={18.5} y={5} />
      <D x={10.75} y={11} />
      <D x={3} y={17} />
      <D x={18.5} y={17} />
    </svg>
  );
}

function OneDriveClouds() {
  const Cloud = ({ x, fill }: { x: number; fill: string }) => (
    <path
      transform={`translate(${x},0)`}
      d="M5 16 C2.5 16 1 14.4 1 12.5 C1 10.7 2.4 9.3 4.2 9.1 C4.8 7 6.7 5.5 9 5.5 C11.4 5.5 13.4 7.2 13.8 9.4 C14.1 9.3 14.4 9.3 14.7 9.3 C16.5 9.3 18 10.8 18 12.6 C18 14.4 16.5 16 14.7 16 Z"
      fill={fill}
    />
  );
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden>
      <Cloud x={0} fill="rgba(255,255,255,0.4)" />
      <Cloud x={4} fill="rgba(255,255,255,0.7)" />
      <Cloud x={8} fill="#ffffff" />
    </svg>
  );
}

const STATUSES = ["Connecting your clouds...", "Loading your files...", "Almost ready..."];

export function LoadingOverlay({ duration = 1200, onDone }: { duration?: number; onDone?: () => void }) {
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setHide(true);
      setRemoved(true);
      onDone?.();
      return;
    }

    // Progress bar via rAF
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1000);
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Status cycle
    const statusInt = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUSES.length);
    }, 400);

    const fadeT = setTimeout(() => setHide(true), duration);
    const removeT = setTimeout(() => {
      setRemoved(true);
      onDone?.();
    }, duration + 320);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(statusInt);
      clearTimeout(fadeT);
      clearTimeout(removeT);
    };
  }, [duration, onDone]);

  if (removed) return null;

  return (
    <div className={`vf-load-overlay ${hide ? "vf-load-hide" : ""}`} aria-hidden={hide}>
      <div className="vf-load-icons">
        <div className="vf-load-circle vf-c1 vf-load-pulse"><GoogleDriveTri /></div>
        <div className="vf-load-circle vf-c2 vf-load-pulse"><DropboxDiamonds /></div>
        <div className="vf-load-circle vf-c3 vf-load-pulse-mid"><OneDriveClouds /></div>
      </div>
      <div
        className="vf-load-word flex items-baseline"
        style={{ fontFamily: '"Inter", sans-serif', fontSize: 24, lineHeight: 1, letterSpacing: "-0.03em" }}
      >
        <span style={{ fontWeight: 300, color: "#ffffff" }}>Vault</span>
        <span style={{ fontWeight: 800, color: "#4d90fe" }}>Fish</span>
      </div>
      <div className="vf-load-bar"><div ref={fillRef} className="vf-load-bar-fill" /></div>
      <div className="vf-load-status">{STATUSES[statusIdx]}</div>
    </div>
  );
}
