import Image from "next/image";

/**
 * Online Tech Uganda logo — the globe from the company's own artwork, locked up
 * with the "Online Tech" wordmark and a spaced "Uganda" tagline.
 *
 * The mark used to be an invented orange "OT" monogram, which meant the site
 * and the company's real logo were two different brands. The globe is cut from
 * the original lockup with its background keyed out, so it sits on the white
 * header and on dark surfaces without a tile behind it.
 */

const SIZES = {
  sm: { w: 38, h: 34 },
  md: { w: 52, h: 46 },
  lg: { w: 62, h: 55 },
} as const;

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
  const mark = SIZES[size];
  const name =
    size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-xl sm:text-[1.35rem]";
  const sub =
    size === "lg"
      ? "text-[11px] tracking-[0.42em]"
      : size === "sm"
        ? "text-[8px] tracking-[0.3em]"
        : "text-[9.5px] tracking-[0.38em]";
  const dot = size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1";

  const wordColor = onLight ? "text-ink-900" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const subColor = onLight ? "text-ink-500" : "text-white/70";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* The globe from the company's own logo */}
      <Image
        src="/globe-mark.png"
        alt=""
        width={mark.w}
        height={mark.h}
        priority
        className="shrink-0 select-none"
        style={{ width: mark.w, height: "auto" }}
      />

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
