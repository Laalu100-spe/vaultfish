// Custom minimal SVG icons for cloud platforms — no real brand logos.

export const PLATFORM_COLORS: Record<string, string> = {
  "Google Drive": "#4d90fe",
  Dropbox: "#60a5fa",
  OneDrive: "#38bdf8",
};

export function GoogleDriveIcon({ size = 18, color = PLATFORM_COLORS["Google Drive"] }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2.5 L15.5 14.5 L2.5 14.5 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function DropboxIcon({ size = 18, color = PLATFORM_COLORS["Dropbox"] }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      {/* square base */}
      <rect x="3.5" y="9" width="11" height="5.5" rx="0.5" stroke={color} strokeWidth={1.5} fill="none" />
      {/* unfolded top — four lines to a center point */}
      <path d="M3.5 9 L9 4 M14.5 9 L9 4 M6.25 9 L9 6.5 M11.75 9 L9 6.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function OneDriveIcon({ size = 18, color = PLATFORM_COLORS["OneDrive"] }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2.5 13.5 L15.5 13.5 C15.5 10.5 13 8.5 10.5 8.5 C9.7 6.5 7.6 5.2 5.4 5.6 C3.5 5.95 2.2 7.5 2.2 9.5 C1.5 10 1.2 10.8 1.5 11.7 C1.7 12.7 2.5 13.5 2.5 13.5 Z"
        stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PlatformIcon({ name, size = 18 }: { name: string; size?: number }) {
  if (name === "Google Drive") return <GoogleDriveIcon size={size} />;
  if (name === "Dropbox") return <DropboxIcon size={size} />;
  if (name === "OneDrive") return <OneDriveIcon size={size} />;
  return null;
}

export function PlatformLabel({ name, size = 13 }: { name: string; size?: number }) {
  return (
    <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: size, fontWeight: 500, color: PLATFORM_COLORS[name] }}>
      {name}
    </span>
  );
}

// Three decreasing horizontal lines — "Smart Clean" mark.
export function DecreasingLinesIcon({
  size = 16,
  color = "#4d90fe",
  widths = [16, 11, 7],
  gap = 3.5,
  thickness = 1.5,
}: {
  size?: number;
  color?: string;
  widths?: [number, number, number];
  gap?: number;
  thickness?: number;
}) {
  const totalH = thickness * 3 + gap * 2;
  const startY = (size - totalH) / 2;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      {widths.map((w, i) => (
        <rect
          key={i}
          x={cx - w / 2}
          y={startY + i * (thickness + gap)}
          width={w}
          height={thickness}
          rx={thickness / 2}
          fill={color}
        />
      ))}
    </svg>
  );
}
