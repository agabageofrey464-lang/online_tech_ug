// Online Tech Uganda admin mark — the "OT" monogram tile matching the storefront
// logo. Rounded orange tile, white OT, gold spark. Scales at any size.
export function BrandLogo({ className = "", title = "Online Tech Uganda" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id="ot-admin-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fa7547" />
          <stop offset="0.55" stopColor="#f15a29" />
          <stop offset="1" stopColor="#c8410f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#ot-admin-bg)" />
      <text
        x="31"
        y="45"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="33"
        fontWeight="800"
        textAnchor="middle"
        fill="#ffffff"
        letterSpacing="-1.5"
      >
        OT
      </text>
      <circle cx="52" cy="15" r="5" fill="#FCDC04" />
    </svg>
  );
}
