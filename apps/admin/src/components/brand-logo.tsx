// Crisp vector brand mark for Online Tech Uganda (admin) — a transparent
// "orbit + spark" tech glyph. Ring/core use currentColor (white on the dark
// sidebar); the spark is brand-orange. Scales perfectly at any size.
export function BrandLogo({ className = "", title = "Online Tech Uganda" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
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
      <circle cx="49.5" cy="18" r="8" fill="#f15a29" />
      <circle cx="49.5" cy="18" r="8" fill="#f15a29" opacity="0.35">
        <animate attributeName="r" values="8;11;8" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="32" r="7.5" fill="currentColor" />
      <circle cx="32" cy="32" r="3.6" fill="#f15a29" />
    </svg>
  );
}
