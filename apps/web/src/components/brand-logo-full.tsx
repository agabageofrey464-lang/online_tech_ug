/**
 * Online Tech Uganda logo — Option 2 "Orange Monogram": a bold orange tile with
 * an "OT" monogram + gold spark, locked up with the "Online Tech" wordmark and a
 * spaced "Uganda" tagline. Reads cleanly on light and dark surfaces.
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

  const wordColor = onLight ? "text-ink-900" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const subColor = onLight ? "text-ink-500" : "text-white/70";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Orange monogram tile */}
      <span
        className={`relative flex ${badge} shrink-0 items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-md ring-1 ring-black/5`}
      >
        <span className={`inline-flex items-start font-display font-black leading-none tracking-tight text-white ${mono}`}>
          OT
          <span className={`ml-[1px] mt-[3px] ${dot} rounded-full`} style={{ background: "#FCDC04" }} />
        </span>
      </span>

      {/* Wordmark + Uganda tagline */}
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black tracking-tight ${name} ${wordColor}`}>
          Online<span className={techColor}>&nbsp;Tech</span>
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
