import { useEffect, useState, type ReactNode, type CSSProperties } from "react";

export function Skeleton({ style, className = "" }: { style?: CSSProperties; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ borderRadius: 8, ...style }} />;
}

export function WithSkeleton({
  skeleton,
  children,
  delay = 1500,
}: {
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div key={loading ? "s" : "c"} className="fade-swap-in">
      {loading ? skeleton : children}
    </div>
  );
}

/* ---------- Per-screen skeletons ---------- */

export function HomeSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <Skeleton style={{ height: 28, width: 140, borderRadius: 6 }} />
      <Skeleton style={{ height: 240, borderRadius: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} style={{ height: 16, borderRadius: 999 }} />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} style={{ height: 96, borderRadius: 14 }} />
        ))}
      </div>
      <Skeleton style={{ height: 84, borderRadius: 14 }} />
      <Skeleton style={{ height: 84, borderRadius: 14 }} />
    </div>
  );
}

export function FilesSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <Skeleton style={{ height: 28, width: 120, borderRadius: 6 }} />
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} style={{ height: 28, width: 92, borderRadius: 999 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}
          >
            <Skeleton style={{ height: 36, width: 36, borderRadius: 8 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton style={{ height: 12, width: "55%", borderRadius: 4 }} />
              <Skeleton style={{ height: 10, width: "35%", borderRadius: 4 }} />
            </div>
            <Skeleton style={{ height: 18, width: 18, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <Skeleton style={{ height: 28, width: 120, borderRadius: 6 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: 138,
          gap: 6,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            style={{ borderRadius: 8, gridRow: i % 5 === 0 ? "span 2" : undefined, height: "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function CloudsSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Skeleton style={{ height: 28, width: 140, borderRadius: 6 }} />
      {[0, 1].map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton style={{ height: 14, width: 120, borderRadius: 4 }} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
              }}
            >
              <Skeleton style={{ height: 40, width: 40, borderRadius: 999 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton style={{ height: 12, width: "45%", borderRadius: 4 }} />
                <Skeleton style={{ height: 10, width: "30%", borderRadius: 4 }} />
                <Skeleton style={{ height: 6, width: "100%", borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <Skeleton style={{ height: 28, width: 140, borderRadius: 6 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: 24,
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
        }}
      >
        <Skeleton style={{ height: 180, width: 180, borderRadius: 999 }} />
      </div>
      <Skeleton style={{ height: 200, borderRadius: 14 }} />
      <Skeleton style={{ height: 120, borderRadius: 14 }} />
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <Skeleton style={{ height: 28, width: 140, borderRadius: 6 }} />
      <Skeleton style={{ height: 200, borderRadius: 14 }} />
      <Skeleton style={{ height: 120, borderRadius: 14 }} />
      <Skeleton style={{ height: 120, borderRadius: 14 }} />
    </div>
  );
}
