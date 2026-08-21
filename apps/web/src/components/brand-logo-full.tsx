import { BrandLogo } from "./brand-logo";

/**
 * The complete Online Tech Uganda logo — the orbit/spark mark locked up with
 * the wordmark as ONE unit. Colour is inherited (use on dark or light).
 * "UGANDA" carries the flag colours for identity.
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
  // On a WHITE surface the white flag letters (U, N) vanish — use the true
  // Uganda flag palette (black / gold / red) which stays fully visible.
  onLight?: boolean;
}) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const name = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-xl sm:text-[1.4rem]";
  const sub = size === "lg" ? "text-xs tracking-[0.5em]" : size === "sm" ? "text-[9px] tracking-[0.34em]" : "text-[10px] tracking-[0.42em]";

  const flagColors = onLight
    ? ["#1a1740", "#B8860B", "#C81E1E", "#1a1740", "#B8860B", "#C81E1E"]
    : ["#ffffff", "#FCDC04", "#D90000", "#ffffff", "#FCDC04", "#D90000"];

  // "Tech" gets a brand-orange accent so the wordmark pops on either surface.
  const techColor = onLight ? "text-brand-600" : "text-brand-400";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandLogo className={`${mark} shrink-0 drop-shadow-sm`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black uppercase leading-none tracking-[-0.02em] ${name}`}>
          Online<span className={techColor}>&nbsp;Tech</span>
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-px w-3 shrink-0 bg-current opacity-30" />
          <span className={`font-black uppercase leading-none ${sub}`}>
            {flag
              ? "UGANDA".split("").map((ch, i) => (
                  <span key={i} style={{ color: flagColors[i] }}>
                    {ch}
                  </span>
                ))
              : "Uganda"}
          </span>
        </span>
      </span>
    </span>
  );
}
