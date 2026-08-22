import { BrandLogo } from "./brand-logo";

/**
 * The complete Online Tech Uganda logo — a solid indigo badge (white orbit +
 * orange spark) locked up with the "Online Tech" wordmark and a Uganda
 * flag-dot tagline. Reads cleanly on both light and dark surfaces.
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
  const name = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-xl sm:text-[1.35rem]";
  const sub = size === "lg" ? "text-[11px] tracking-[0.42em]" : size === "sm" ? "text-[8px] tracking-[0.3em]" : "text-[9.5px] tracking-[0.38em]";
  const dot = size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1";

  const wordColor = onLight ? "text-ink-900" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const subColor = onLight ? "text-ink-500" : "text-white/70";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Solid brand badge — orbit reads as white, the spark stays orange */}
      <span
        className={`relative flex ${badge} shrink-0 items-center justify-center bg-gradient-to-br from-ink-500 via-ink-600 to-ink-800 text-white shadow-md ring-1 ring-white/10`}
      >
        <BrandLogo className="h-[64%] w-[64%]" />
      </span>

      {/* Wordmark + Uganda flag-dot tagline */}
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black uppercase leading-none tracking-[-0.01em] ${name} ${wordColor}`}>
          Online<span className={techColor}>&nbsp;Tech</span>
        </span>
        <span className="mt-1.5 flex items-center gap-1.5">
          {flag && (
            <span className="flex items-center gap-[3px]">
              <span className={`${dot} rounded-full`} style={{ background: "#111827" }} />
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
