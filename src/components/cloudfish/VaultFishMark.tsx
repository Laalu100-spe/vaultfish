type Props = {
  size?: number;
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
};

// Aspect ratio 255:105 — proportional scaling only (width derived from height).
export function VaultFishMark({ size = 28, fill = "#4D90FE", className, style }: Props) {
  const height = size;
  const width = (size * 255) / 105;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 255 105"
      width={width}
      height={height}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M 30 90 C 10 60, 20 25, 60 15 C 100 5, 150 10, 190 40 C 205 20, 225 15, 225 15 C 220 35, 218 45, 218 45 C 218 45, 220 55, 225 75 C 225 75, 205 70, 190 50 C 150 80, 100 85, 60 75 C 20 65, 10 60, 30 90 Z"
        fill={fill}
      />
      <circle cx="185" cy="38" r="6" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
