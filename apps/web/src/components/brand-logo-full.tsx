/**
 * The Online Tech Uganda lockup.
 *
 * A logo is one object, not an icon placed near some words. The OT monogram
 * and the wordmark used to sit as two separate blocks with a gap between them,
 * which reads as a badge someone put next to a company name.
 *
 * Three things bind them here:
 *  - the monogram's height is exactly the height of the text block, so the top
 *    of ONLINE and the baseline of UGANDA both land on the tile's edges;
 *  - a brand-coloured rule runs out of the tile and under the wordmark, so the
 *    eye travels from mark to name without a break;
 *  - the tile's inner corners are squared, so it docks against the text
 *    instead of floating beside it.
 *
 * Proportions are fixed per size rather than left to the type metrics, because
 * a lockup that shifts by a pixel at a different size stops being a lockup.
 */

type Size = "sm" | "md" | "lg";

const SIZES: Record<
  Size,
  {
    box: string;
    mono: string;
    spark: string;
    name: string;
    sub: string;
    rule: string;
    dot: string;
    gap: string;
  }
> = {
  sm: {
    box: "h-9 w-9",
    mono: "text-[15px]",
    spark: "h-[3px] w-[3px]",
    name: "text-[15px]",
    sub: "text-[7.5px] tracking-[0.32em]",
    rule: "h-[2px] -ml-[9px] w-[calc(100%+9px)]",
    dot: "h-[3px] w-[3px]",
    gap: "pl-[9px] -ml-[5px]",
  },
  md: {
    box: "h-12 w-12",
    mono: "text-xl",
    spark: "h-1 w-1",
    name: "text-xl sm:text-[1.32rem]",
    sub: "text-[9px] tracking-[0.36em]",
    rule: "h-[2.5px] -ml-3 w-[calc(100%+12px)]",
    dot: "h-1 w-1",
    gap: "pl-3 -ml-1.5",
  },
  lg: {
    box: "h-14 w-14",
    mono: "text-2xl",
    spark: "h-1.5 w-1.5",
    name: "text-2xl sm:text-3xl",
    sub: "text-[11px] tracking-[0.4em]",
    rule: "h-[3px] -ml-[14px] w-[calc(100%+14px)]",
    dot: "h-1.5 w-1.5",
    gap: "pl-3.5 -ml-2",
  },
};

export function BrandLogoFull({
  className = "",
  size = "md",
  flag = true,
  onLight = false,
}: {
  className?: string;
  size?: Size;
  flag?: boolean;
  onLight?: boolean;
}) {
  const s = SIZES[size];

  const wordColor = onLight ? "text-ink-900" : "text-white";
  const techColor = onLight ? "text-brand-600" : "text-brand-400";
  const subColor = onLight ? "text-ink-500" : "text-white/70";

  return (
    <span className={`inline-flex items-stretch text-left ${className}`} aria-label="Online Tech Uganda">
      {/* The monogram. Squared on the inner edge so it docks against the name. */}
      <span
        className={`relative z-10 flex ${s.box} shrink-0 items-center justify-center rounded-l-xl rounded-r-[4px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-md ring-1 ring-black/5`}
      >
        <span
          className={`inline-flex items-start font-display font-black leading-none tracking-[-0.04em] text-white ${s.mono}`}
        >
          OT
          <span
            className={`ml-[1px] mt-[3px] ${s.spark} shrink-0 rounded-full`}
            style={{ background: "#FCDC04" }}
          />
        </span>
      </span>

      {/* The name, held to exactly the monogram's height and tucked under its
          edge so the rule below appears to come out of the tile. */}
      <span className={`flex flex-col justify-between ${s.gap}`}>
        <span
          className={`font-display font-black uppercase leading-none tracking-[0.01em] ${s.name} ${wordColor}`}
        >
          ONLINE<span className={techColor}>&nbsp;TECH</span>
        </span>

        {/* The connector: runs from behind the tile to the end of the name. */}
        <span
          className={`${s.rule} rounded-full bg-gradient-to-r from-brand-500 to-brand-400`}
          aria-hidden="true"
        />

        <span className="flex items-center gap-1.5">
          {flag && (
            <span className="flex shrink-0 items-center gap-[3px]" aria-hidden="true">
              <span
                className={`${s.dot} rounded-full`}
                style={{ background: onLight ? "#111827" : "#ffffff" }}
              />
              <span className={`${s.dot} rounded-full`} style={{ background: "#FCDC04" }} />
              <span className={`${s.dot} rounded-full`} style={{ background: "#D90000" }} />
            </span>
          )}
          <span className={`font-bold uppercase leading-none ${s.sub} ${subColor}`}>Uganda</span>
        </span>
      </span>
    </span>
  );
}
