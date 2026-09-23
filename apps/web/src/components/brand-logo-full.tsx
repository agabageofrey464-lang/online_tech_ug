import Image from "next/image";

/**
 * Online Tech Uganda logo — the orange "OT" monogram tile with the globe from
 * the company's own artwork sitting behind it, locked up with the "Online Tech"
 * wordmark and a spaced "Uganda" tagline.
 *
 * The globe is half again as wide as the tile and sits to its left, so it
 * reads as a planet with the badge in front of it. Centring the tile on the
 * globe simply hid it — the badge covered all but a fringe.
 *
 * The globe is positioned absolutely and allowed to overflow, so adding it
 * did not make the header taller.
 */
export function BrandLogoFull({
  className = "",
  size = "md",
  flag = true,
  onLight = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  flag?: boolean;
  onLight?: boolean;
}) {
  const badge = size === "lg" ? "h-14 w-14 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-lg" : "h-12 w-12 rounded-xl";
  const mono = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  const name = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-xl sm:text-[1.35rem]";
  const sub = size === "lg" ? "text-[11px] tracking-[0.42em]" : size === "sm" ? "text-[8px] tracking-[0.3em]" : "text-[9.5px] tracking-[0.38em]";
  const dot = size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1";

  // Tile edge in px, and the globe at 1.5x that, sitting behind and left.
  const tilePx = size === "lg" ? 56 : size === "sm" ? 36 : 48;
  const globeW = Math.round(tilePx * 1.5);
  const wrapW = Math.round(tilePx * 1.46);

  const wordColor = onLight ? "text-ink-900" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const subColor = onLight ? "text-ink-500" : "text-white/70";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Globe behind, orange monogram tile in front */}
      <span
        className="relative inline-flex shrink-0 items-center justify-end"
        style={{ width: wrapW, height: tilePx }}
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
          className={`relative flex ${badge} shrink-0 items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-lg ring-1 ring-black/10`}
        >
          <span className={`inline-flex items-start font-display font-black leading-none tracking-tight text-white ${mono}`}>
            OT
            <span className={`ml-[1px] mt-[3px] ${dot} rounded-full`} style={{ background: "#FCDC04" }} />
          </span>
        </span>
      </span>

      {/* Wordmark + Uganda tagline */}
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black uppercase tracking-[0.01em] ${name} ${wordColor}`}>
          ONLINE<span className={techColor}>&nbsp;TECH</span>
        </span>
        <span className="mt-1.5 flex items-center gap-1.5">
          {flag && (
            <span className="flex items-center gap-[3px]">
              <span className={`${dot} rounded-full`} style={{ background: onLight ? "#111827" : "#ffffff" }} />
              <span className={`${dot} rounded-full`} style={{ background: "#FCDC04" }} />
              <span className={`${dot} rounded-full`} style={{ background: "#D90000" }} />
            </span>
          )}
          <span className={`font-bold uppercase leading-none ${sub} ${subColor}`}>Uganda</span>
        </span>
      </span>
    </span>
  );
}
