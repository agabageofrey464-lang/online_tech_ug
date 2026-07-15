// Crisp vector brand mark for Online Tech Uganda — a transparent "orbit + spark"
// tech glyph. The ring/core use `currentColor` so the mark adapts to any
// background (white on the dark header, indigo on light pages); the spark is
// always brand-orange. Scales perfectly at any size with no pixelation.
export function BrandLogo({ className = "", title = "Online Tech Uganda" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      {/* Orbit ring (open) — bold and near the edges so the mark reads large */}
      <circle
        cx="32"
        cy="32"
        r="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeDasharray="94 30"
        transform="rotate(-45 32 32)"
      />

      {/* Orbiting spark — larger, with a soft pulse halo */}
      <circle cx="49.5" cy="18" r="8" fill="#f15a29" />
      <circle cx="49.5" cy="18" r="8" fill="#f15a29" opacity="0.35">
        <animate attributeName="r" values="8;11;8" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Core */}
      <circle cx="32" cy="32" r="7.5" fill="currentColor" />
      <circle cx="32" cy="32" r="3.6" fill="#f15a29" />
    </svg>
  );
}
