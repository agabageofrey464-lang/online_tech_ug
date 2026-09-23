import Image from "next/image";

/**
 * Online Tech Uganda admin mark — the orange "OT" monogram tile with the globe
 * from the company's own logo behind it, matching the storefront header.
 *
 * The globe is half again as wide as the tile and sits to its left, so it
 * reads as a planet with the badge in front. It is positioned absolutely and
 * allowed to overflow, so the mark takes no more vertical room than the tile.
 */
export function BrandLogo({
  className = "",
  title = "Online Tech Uganda",
  size = 40,
}: {
  className?: string;
  title?: string;
  /** Edge of the orange tile, in px. The globe scales from it. */
  size?: number;
}) {
  const globeW = Math.round(size * 1.5);
  const wrapW = Math.round(size * 1.46);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-end ${className}`}
      style={{ width: wrapW, height: size }}
      role="img"
      aria-label={title}
    >
      <Image
        src="/globe-mark.png"
        alt=""
        width={globeW}
        height={Math.round((globeW * 229) / 256)}
        priority
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none"
        style={{ left: -2, width: globeW, height: "auto" }}
      />
      <span
        className="relative flex items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-lg ring-1 ring-black/10"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.23) }}
      >
        <span
          className="inline-flex items-start font-black leading-none tracking-tight text-white"
          style={{ fontSize: Math.round(size * 0.44) }}
        >
          OT
          <span
            className="ml-[1px] mt-[3px] rounded-full"
            style={{ background: "#FCDC04", width: Math.round(size * 0.09), height: Math.round(size * 0.09) }}
          />
        </span>
      </span>
    </span>
  );
}
