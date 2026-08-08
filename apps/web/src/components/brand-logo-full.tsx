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
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  flag?: boolean;
}) {
  const mark = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const name = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const sub = size === "lg" ? "text-sm tracking-[0.4em]" : size === "sm" ? "text-[9px] tracking-[0.3em]" : "text-[11px] tracking-[0.34em]";

  const flagColors = ["#ffffff", "#FCDC04", "#D90000", "#ffffff", "#FCDC04", "#D90000"];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandLogo className={`${mark} shrink-0 drop-shadow-sm`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black tracking-tight ${name}`}>Online&nbsp;Tech</span>
        <span className={`mt-0.5 font-black uppercase ${sub}`}>
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
  );
}
